const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const statusHandler = require("./api/status.js");

const publicDir = path.join(__dirname, "outputs");
const port = Number(process.env.PORT || 10000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendText(res, statusCode, text) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(text);
}

function getSafeFilePath(urlPathname) {
  const pathname = decodeURIComponent(urlPathname);
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    return null;
  }

  return filePath;
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let filePath = getSafeFilePath(url.pathname);

  if (!filePath) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    let stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = await fs.stat(filePath);
    }

    if (!stat.isFile()) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", ext === ".html" ? "no-cache" : "public, max-age=3600");
    res.end(await fs.readFile(filePath));
  } catch {
    sendText(res, 404, "Not found");
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/api/status") {
      await statusHandler(req, res);
      return;
    }

    await serveStatic(req, res);
  });
}

if (require.main === module) {
  createServer().listen(port, () => {
    console.log(`Amsterdam Roleplay site running on port ${port}`);
  });
}

module.exports = { createServer };
