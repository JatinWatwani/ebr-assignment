const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function resolveFile(reqPath) {
  // Strip leading slash
  const cleanPath = reqPath.replace(/^\/+/, '');
  
  if (!cleanPath || cleanPath === '') {
    return path.join(PUBLIC_DIR, 'index.html');
  }

  // Direct candidate
  let candidate = path.join(PUBLIC_DIR, cleanPath);
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  // Try appending .html (e.g. /shop -> /shop.html, /cart -> /cart.html)
  if (fs.existsSync(candidate + '.html') && fs.statSync(candidate + '.html').isFile()) {
    return candidate + '.html';
  }

  // Try directory index.html
  if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
    const idx = path.join(candidate, 'index.html');
    if (fs.existsSync(idx)) return idx;
  }

  // Case-insensitive fallback
  try {
    const dir = path.dirname(candidate);
    const base = path.basename(candidate).toLowerCase();
    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir);
      const match = entries.find(e => e.toLowerCase() === base || e.toLowerCase() === base + '.html');
      if (match) {
        const full = path.join(dir, match);
        if (fs.statSync(full).isFile()) return full;
      }
    }
  } catch (e) {}

  return null;
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const reqPath = decodeURI(urlObj.pathname);

  const matchedFile = resolveFile(reqPath);

  if (matchedFile && matchedFile.startsWith(PUBLIC_DIR)) {
    const ext = path.extname(matchedFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    console.log(`[200] ${req.method} ${req.url} -> ${path.basename(matchedFile)}`);

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(matchedFile).pipe(res);
  } else {
    console.warn(`[404] ${req.method} ${req.url} (Not Found)`);

    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>404 - Page Not Found | LUMORA</title>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&family=Titan+One&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background-color: #FFF5F8; color: #1A1A1A; font-family: 'Fredoka', sans-serif; }
          .text-stroke { -webkit-text-stroke: 3px #1A1A1A; color: #FFF; font-family: 'Titan One', cursive; }
          .btn-brutal { border: 4px solid #1A1A1A; box-shadow: 6px 6px 0px 0px #1A1A1A; transition: transform 0.15s; }
          .btn-brutal:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0px 0px #1A1A1A; }
        </style>
      </head>
      <body class="min-h-screen flex items-center justify-center p-6">
        <div class="bg-white border-8 border-black rounded-[3rem] p-10 max-w-lg w-full text-center shadow-[10px_10px_0px_#1A1A1A]">
          <div class="text-7xl mb-4">🔍</div>
          <h1 class="text-stroke text-5xl md:text-6xl text-pink-500 mb-4">PAGE NOT FOUND!</h1>
          <p class="font-black text-xl text-gray-600 mb-2">Requested route: <code class="bg-yellow-200 px-2 py-1 rounded border-2 border-black">${req.url}</code></p>
          <p class="font-bold text-gray-500 mb-8">Let's get you back to the smart home vibe:</p>
          <div class="flex flex-col gap-3 font-black text-lg">
            <a href="/" class="btn-brutal bg-yellow-400 py-3 rounded-full">🏠 HOME PAGE</a>
            <a href="/shop.html" class="btn-brutal bg-cyan-400 text-white py-3 rounded-full">🛍️ SHOP / SYSTEMS</a>
            <a href="/product.html" class="btn-brutal bg-pink-500 text-white py-3 rounded-full">💡 GLOW BULB (MULTI-VIEW)</a>
            <a href="/cart.html" class="btn-brutal bg-green-400 py-3 rounded-full">🛒 YOUR CART</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`LUMORA Web Server active at http://localhost:${PORT}/`);
  console.log(`Available pages:`);
  console.log(`  - Home:    http://localhost:${PORT}/ (or /index.html)`);
  console.log(`  - Shop:    http://localhost:${PORT}/shop.html (or /shop)`);
  console.log(`  - Product: http://localhost:${PORT}/product.html (or /product)`);
  console.log(`  - Cart:    http://localhost:${PORT}/cart.html (or /cart)`);
});
