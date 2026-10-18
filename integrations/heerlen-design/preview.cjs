const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{Readable}=require('node:stream');
const cache=new Map(),port=Number(process.env.PORT)||4300;
const own=new Map([['/assets/amsterdam-heerlen.css','text/css'],['/assets/amsterdam-heerlen.js','text/javascript'],['/assets/amsterdam-regulations-data.js','text/javascript'],['/assets/amsterdam-regulations.js','text/javascript'],['/assets/amsterdam-regulations.css','text/css']]);
const server=http.createServer(async(req,res)=>{try{
 if(!req.url.startsWith('/')||req.url.startsWith('//')){res.writeHead(400);return res.end();}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(409,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Dit is een ontwerpvoorbeeld. Een aankoop, claim of accountwijziging moet op de bestaande website gebeuren.'}));}
 if(pathname==='/api/auth/discord/login'){res.writeHead(302,{Location:'https://amsterdamrp.nl'+req.url});return res.end();}
 if(own.has(pathname)){res.writeHead(200,{'Content-Type':own.get(pathname),'Cache-Control':'no-store'});return res.end(fs.readFileSync(path.join(__dirname,pathname)));}
 res.setHeader('X-Robots-Tag','noindex');
 if(cache.has(req.url)){const item=cache.get(req.url);res.writeHead(item.status,{'Content-Type':item.type,'Cache-Control':'no-store'});return res.end(item.body);}
 const headers={Accept:req.headers.accept||'*/*'};if(req.headers.range)headers.Range=req.headers.range;
 const upstream=await fetch('https://amsterdamrp.nl'+req.url,{headers,signal:AbortSignal.timeout(pathname.endsWith('.mp4')?180000:25000),redirect:'manual'});
 if(upstream.status>=300&&upstream.status<400){res.writeHead(upstream.status,{Location:upstream.headers.get('location')});return res.end();}
 const type=upstream.headers.get('content-type')||'application/octet-stream';
 if(type.includes('text/html')){let html=await upstream.text();html=html.replace('</head>','<link rel="stylesheet" href="/assets/amsterdam-heerlen.css"><link rel="stylesheet" href="/assets/amsterdam-regulations.css"><script defer src="/assets/amsterdam-regulations-data.js"></script><script defer src="/assets/amsterdam-heerlen.js"></script><script defer src="/assets/amsterdam-regulations.js"></script></head>');res.writeHead(upstream.status,{'Content-Type':type,'Cache-Control':'no-store'});return res.end(html);}
 if(/javascript|text\/css|svg\+xml/.test(type)){const body=Buffer.from(await upstream.arrayBuffer());if(body.length<4000000)cache.set(req.url,{status:upstream.status,type,body});res.writeHead(upstream.status,{'Content-Type':type,'Cache-Control':'no-store'});return res.end(body);}
 const responseHeaders={'Content-Type':type,'Cache-Control':pathname.startsWith('/api/')?'no-store':'public,max-age=120'};for(const h of ['content-length','content-range','accept-ranges']){const v=upstream.headers.get(h);if(v)responseHeaders[h]=v;}
 res.writeHead(upstream.status,responseHeaders);if(!upstream.body)return res.end();const stream=Readable.fromWeb(upstream.body);stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch(error){if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Voorbeeld kon deze publieke bron niet laden.'}));}});
server.listen(port,'127.0.0.1',()=>console.log('Amsterdam ontwerpvoorbeeld: http://127.0.0.1:'+port+' — alleen-lezen; bestaande Amsterdam-app en API blijven de bron.'));
