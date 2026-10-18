/* Presentation adapter for the existing Amsterdam app. Business logic and API calls stay in the original React bundle. */
(()=>{'use strict';
 if(window.amsterdamHeerlenDesign)return;
 const root=document.getElementById('root');if(!root)return;
 const html=document.documentElement;html.classList.add('amrp-heerlen');
 const icons={home:'<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z"/>',bag:'<path d="M4 7h16l1 14H3zm4 0V6a4 4 0 0 1 8 0v1"/>',skin:'<path d="m5 5 5-2 4 4 5-2 2 5-4 3-1 7-5 1-2-6-6-1z"/>',trophy:'<path d="M8 3h8v7a4 4 0 0 1-8 0zM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8"/>',book:'<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5z"/>',shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',discord:'<path d="M8 5 6 4 3 7 2 17l5 3 2-3m6 0 2 3 5-3-1-10-3-3-2 1M7 6a18 18 0 0 1 10 0"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/>',chevron:'<path d="m9 6 6 6-6 6"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
 const discordMask='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+icons.discord+'</svg>';
 html.style.setProperty('--amrp-discord-icon','url("data:image/svg+xml,'+encodeURIComponent(discordMask)+'")');
 const routes=[['/','Home','home','community'],['/doneren','Winkel','bag','community'],['/camos','Wapen skins','skin','community'],['/leaderboards','Leaderboards','trophy','community'],['/regels#apv','APV','book','rules'],['/regels#sancties','Strafcategorieën','shield','rules'],['/regels#algemeen','Algemene regels','book','rules'],['/regels#discord','Discord-regels','discord','rules'],['/doneren/cart','Winkelmand','bag','extra'],['/voorwaarden','Voorwaarden','shield','info'],['/privacy','Privacybeleid','lock','info']];
 const create=(tag,cls,markup)=>{const e=document.createElement(tag);e.className=cls;if(markup)e.innerHTML=markup;return e;};
 const nav=group=>routes.filter(r=>r[3]===group).map(([url,label,symbol])=>'<a class="amrp-nav-link" href="'+url+'" data-amrp-route>'+icon(symbol)+'<span>'+label+'</span>'+(url==='/regels#apv'?'<small class="amrp-nav-count">65</small>':'')+'</a>').join('');
 const sidebar=create('aside','amrp-sidebar','<button class="amrp-ui-button amrp-ui-icon amrp-menu-close" type="button" aria-label="Navigatie sluiten">'+icon('close')+'</button><a class="amrp-brand" href="/" data-amrp-route><img src="/assets/img/logo-t.png" width="44" height="44" alt=""><span><strong>AMSTERDAM</strong><small>ROLEPLAY</small></span></a><div class="amrp-nav-label">ONTDEK AMSTERDAM</div><nav aria-label="Communitynavigatie">'+nav('community')+'</nav><div class="amrp-nav-label">REGELGEVING</div><nav aria-label="Regelgeving">'+nav('rules')+'</nav><div class="amrp-nav-label">EXTRA</div><nav aria-label="Extra">'+nav('extra')+'</nav><div class="amrp-nav-label">INFORMATIE</div><nav aria-label="Informatienavigatie">'+nav('info')+'</nav><div class="amrp-sidebar-bottom"><div class="amrp-community">'+icon('discord')+'<strong>De stad begint bij jou.</strong><p>Speel samen. Maak verhalen.<br>Blijf verbonden met de community.</p><a data-amrp-discord href="https://discord.gg/tGqZBUYmZu" target="_blank" rel="noopener noreferrer">Naar onze Discord &nbsp;↗</a></div><div class="amrp-sidebar-foot">Amsterdam Roleplay</div></div>');sidebar.id='amrp-design-sidebar';
 const topbar=create('div','amrp-topbar','<button type="button" class="amrp-ui-button amrp-ui-icon amrp-menu-toggle" aria-label="Open navigatie" aria-controls="amrp-design-sidebar" aria-expanded="false">'+icon('menu')+'</button><div class="amrp-crumb"><span>Community</span>'+icon('chevron')+'<strong data-amrp-current>Home</strong></div><div class="amrp-topbar-actions"><button class="amrp-quick-search amrp-ui-icon" type="button">'+icon('search')+'<span>Snel zoeken</span><kbd>Ctrl K</kbd></button><button type="button" class="amrp-ui-button amrp-ui-icon amrp-theme-toggle" aria-label="Licht thema inschakelen">'+icon('sun')+'</button></div>');
 const backdrop=create('button','amrp-scrim');backdrop.hidden=true;backdrop.type='button';backdrop.setAttribute('aria-label','Navigatie sluiten');backdrop.tabIndex=-1;
 const command=create('dialog','amrp-command-dialog','<div class="amrp-command-head"><label class="sr-only" for="amrp-command-search">Zoek een pagina</label><input id="amrp-command-search" type="search" placeholder="Waar wil je naartoe?" autocomplete="off"><button class="amrp-ui-button amrp-ui-icon" type="button" aria-label="Zoekvenster sluiten">'+icon('close')+'</button></div><div class="amrp-command-list">'+nav('community')+nav('rules')+nav('extra')+nav('info')+'</div><p class="amrp-command-empty" hidden>Geen pagina gevonden.</p>');
 document.body.append(sidebar,backdrop,topbar,command);
 // Only restyle the current reopening announcement. Future admin announcements keep their own text.
 let announcementBar=null;
 function polishAnnouncement(){
  const bar=document.getElementById('arp-mededeling-bar');if(!bar)return;
  if(bar!==announcementBar){announcementBar=bar;announcementObserver.observe(bar,{childList:true,subtree:true,characterData:true});}
  if(bar.querySelector('.amrp-announcement-message'))return;
  const text=bar.textContent.toLocaleLowerCase('nl');
  if(!text.includes('amsterdam roleplay komt terug!')||!text.includes('wij zijn momenteel hard aan het werken'))return;
  const label=create('span','amrp-announcement-label');label.textContent='Serverupdate';
  const message=create('span','amrp-announcement-message');message.textContent='Amsterdam Roleplay wordt vernieuwd. We werken aan de heropening van de server.';
  const link=create('a','amrp-announcement-link');link.href=sidebar.querySelector('[data-amrp-discord]').href;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Volg onze Discord voor updates ↗';
  bar.replaceChildren(label,message,link);
 }
 const announcementObserver=new MutationObserver(polishAnnouncement);announcementObserver.observe(document.body,{childList:true});polishAnnouncement();
 const mobile=matchMedia('(max-width:760px)'),toggle=topbar.querySelector('.amrp-menu-toggle');let menuOpen=false;
 const closeMenu=()=>{menuOpen=false;sidebar.dataset.open='false';backdrop.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.style.removeProperty('overflow');sidebar.inert=mobile.matches;};
 const openMenu=()=>{menuOpen=true;sidebar.inert=false;sidebar.dataset.open='true';backdrop.hidden=false;toggle.setAttribute('aria-expanded','true');document.body.style.overflow='hidden';sidebar.querySelector('a')?.focus();};
 toggle.addEventListener('click',()=>menuOpen?closeMenu():openMenu());backdrop.addEventListener('click',closeMenu);sidebar.querySelector('.amrp-menu-close').addEventListener('click',()=>{closeMenu();toggle.focus();});mobile.addEventListener('change',closeMenu);closeMenu();
 function nativeLink(url){return [...root.querySelectorAll('a[href]')].find(a=>a.getAttribute('href')===url);}
 function navigate(url){closeMenu();command.close();const target=new URL(url,location.href),original=nativeLink(target.pathname);if(target.pathname===location.pathname&&target.pathname==='/regels'){location.hash=target.hash||'#apv';schedule();return;}if(original){original.click();if(target.hash){history.replaceState(history.state,'',url);window.dispatchEvent(new Event('hashchange'));}schedule();}else location.assign(url);}
 [sidebar,command].forEach(host=>host.addEventListener('click',event=>{const a=event.target.closest('a[data-amrp-route]');if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();navigate(a.getAttribute('href'));}));
 topbar.querySelector('.amrp-quick-search').addEventListener('click',()=>{command.showModal();command.querySelector('input').focus();});command.querySelector('button').addEventListener('click',()=>command.close());
 command.querySelector('input').addEventListener('input',event=>{const query=event.target.value.toLocaleLowerCase('nl');let count=0;command.querySelectorAll('a').forEach(a=>{a.hidden=!a.textContent.toLocaleLowerCase('nl').includes(query);if(!a.hidden)count++;});command.querySelector('.amrp-command-empty').hidden=count>0;});
 document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(!command.open)command.showModal();command.querySelector('input').focus();}if(event.key==='Escape'&&menuOpen){closeMenu();toggle.focus();}if(event.key==='Tab'&&menuOpen){const links=[...sidebar.querySelectorAll('a,button')].filter(e=>e.getClientRects().length);const first=links[0],last=links.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 const themeButton=topbar.querySelector('.amrp-theme-toggle');let theme='dark';try{theme=localStorage.getItem('amsterdam-design-theme')==='light'?'light':'dark';}catch{}
 function setTheme(value){theme=value;html.dataset.amrpTheme=value;themeButton.setAttribute('aria-label',value==='dark'?'Licht thema inschakelen':'Donker thema inschakelen');themeButton.setAttribute('aria-pressed',String(value==='light'));try{localStorage.setItem('amsterdam-design-theme',value);}catch{}}
 themeButton.addEventListener('click',()=>setTheme(theme==='dark'?'light':'dark'));setTheme(theme);
 const serverCard=create('section','amrp-server-card','<div class="amrp-server-heading"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h5l3-8 4 16 3-8h5"/></svg>Serverstatus</span><small>FIVEM</small></div><div class="amrp-server-state" role="status" aria-live="polite"><i></i><strong data-status-label>Controleren…</strong></div><p data-status-description>De actuele serverstatus wordt opgehaald.</p><div class="amrp-server-numbers"><div><strong data-status-players>—</strong><span>spelers online</span></div><div><strong data-status-capacity>—</strong><span>plaatsen</span></div></div><div class="amrp-server-check"><span data-status-checked>Nog niet gecontroleerd</span><button type="button" aria-label="Serverstatus vernieuwen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7a9 9 0 0 0-15-2L2 8m0-5v5h5m-3 9a9 9 0 0 0 15 2l3-3m0 5v-5h-5"/></svg></button></div>');
 serverCard.setAttribute('aria-label','FiveM-serverstatus');serverCard.dataset.status='loading';
 let statusActive=false,statusTimer=null,statusRequest=null;
 const statusText=(selector,value)=>{const el=serverCard.querySelector(selector);if(el.textContent!==value)el.textContent=value;};
 function displayStatus(state,players=null,capacity=null,checked=null){
  serverCard.dataset.status=state;
  statusText('[data-status-label]',{online:'Online',offline:'Offline',unknown:'Onbekend',loading:'Controleren…'}[state]);
  statusText('[data-status-description]',{online:'Actuele spelerstelling via onze FiveM-statuskoppeling.',offline:'De server is momenteel offline.',unknown:'De serverstatus kan momenteel niet worden bevestigd.',loading:'De actuele serverstatus wordt opgehaald.'}[state]);
  statusText('[data-status-players]',players===null?'—':String(players));statusText('[data-status-capacity]',capacity===null?'—':String(capacity));
  statusText('[data-status-checked]',checked?'Gecontroleerd '+new Date(checked).toLocaleTimeString('nl-NL',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit'}):'Nog niet gecontroleerd');
 }
 async function refreshStatus(){
  if(!statusActive||statusRequest)return;
  const controller=new AbortController();statusRequest=controller;const timeout=setTimeout(()=>controller.abort(),8000);
  serverCard.querySelector('button').disabled=true;serverCard.setAttribute('aria-busy','true');displayStatus('loading');
  try{
   const response=await fetch('/api/server/status?t='+Date.now(),{cache:'no-store',credentials:'same-origin',signal:controller.signal});
   if(!response.ok)throw Error('Status niet bereikbaar');const data=await response.json();
   if(!statusActive||statusRequest!==controller)return;
   const players=typeof data.players==='number'?data.players:typeof data.online==='number'?data.online:null;
   const capacity=typeof data.maxPlayers==='number'?data.maxPlayers:data.max;
   const timestamp=typeof data.updatedAt==='number'?data.updatedAt:Date.parse(data.updatedAt);
   const fresh=Number.isFinite(timestamp)&&Date.now()-timestamp<=90000&&timestamp-Date.now()<=30000;
   const valid=Number.isInteger(players)&&players>=0&&Number.isInteger(capacity)&&capacity>0;
   if(fresh&&valid&&(data.live===true||data.online===true)&&data.status!=='offline')displayStatus('online',players,capacity,Date.now());
   else if(fresh&&(data.status==='offline'||data.online===false))displayStatus('offline',0,Number.isInteger(capacity)&&capacity>0?capacity:null,Date.now());
   else displayStatus('unknown',null,null,Date.now());
  }catch{if(statusActive&&statusRequest===controller)displayStatus('unknown',null,null,Date.now());}
  finally{clearTimeout(timeout);if(statusRequest===controller){statusRequest=null;serverCard.querySelector('button').disabled=false;serverCard.removeAttribute('aria-busy');}}
 }
 function stopStatus(){statusActive=false;clearInterval(statusTimer);statusTimer=null;const request=statusRequest;statusRequest=null;request?.abort();serverCard.querySelector('button').disabled=false;serverCard.removeAttribute('aria-busy');}
 function mountStatus(copy){
  const native=copy.querySelector(':scope > div:has(.tabular-nums)');if(!native)return;
  native.classList.add('amrp-home-status');if(serverCard.parentElement!==copy)copy.insertBefore(serverCard,native);
  if(!statusActive){statusActive=true;refreshStatus();statusTimer=setInterval(refreshStatus,30000);}
 }
 serverCard.querySelector('button').addEventListener('click',refreshStatus);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&statusActive)refreshStatus();});
 let lastPath='',frame=0,nativeActions=null;const resize=new ResizeObserver(entries=>{for(const entry of entries)topbar.style.setProperty('--amrp-native-width',(Math.ceil(entry.contentRect.width)+20)+'px');});
 function update(){
  frame=0;const main=root.querySelector(':scope > main'),content=main?.children[1];if(!main||!content)return;
  content.classList.add('amrp-content');const header=root.querySelector('header');
  if(header){header.classList.add('amrp-native-header');header.closest('.sticky')?.classList.add('amrp-header-sticky');const actions=header.querySelector('#Amsterdam-auth-slot')?.parentElement;if(actions){actions.classList.add('amrp-native-actions');if(actions!==nativeActions){resize.disconnect();resize.observe(actions);nativeActions=actions;}}const strip=main.children[0]?.querySelector('.relative.overflow-hidden');strip?.classList.add('amrp-benefits-strip');const discord=header.querySelector('nav a[href*="discord.gg"]');if(discord)sidebar.querySelector('[data-amrp-discord]').href=discord.href;}
  const home=location.pathname==='/',hero=home?content.querySelector('section:has(video)'):null;
  if(hero){hero.classList.add('amrp-home-hero');const copy=hero.querySelector(':scope > div.relative');if(copy){copy.classList.add('amrp-home-copy');mountStatus(copy);}}else if(statusActive)stopStatus();
  if(location.pathname+location.hash!==lastPath){lastPath=location.pathname+location.hash;const selected=routes.find(r=>r[0]!=='/'&&(lastPath===r[0]||lastPath.startsWith(r[0]+'/')))||routes[0];const exact=routes.find(r=>r[0]===lastPath)||(location.pathname==='/regels'?routes.find(r=>r[0]==='/regels#apv'):null)||selected;topbar.querySelector('[data-amrp-current]').textContent=lastPath.startsWith('/product/')?'Product bekijken':exact[1];topbar.querySelector('.amrp-crumb>span').textContent=exact[3]==='rules'?'Regelgeving':exact[3]==='info'?'Informatie':'Community';sidebar.querySelectorAll('.amrp-nav-link').forEach(a=>{const active=a.getAttribute('href')===exact[0];if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
  window.amsterdamRegulations?.sync();
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};new MutationObserver(schedule).observe(root,{childList:true,subtree:true});window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);update();
 window.amsterdamHeerlenDesign={version:'1.0.0',refresh:schedule};
})();
