const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff'
};

const ROUTE_MAP = {
  '/': 'index.html',
  '/index': 'index.html',
  '/index.html': 'index.html',
  '/pages/shop': 'shop.html',
  '/shop': 'shop.html',
  '/shop.html': 'shop.html',
  '/pages/weddings': 'weddings.html',
  '/weddings': 'weddings.html',
  '/weddings.html': 'weddings.html',
  '/pages/content-hub': 'content-hub.html',
  '/content-hub': 'content-hub.html',
  '/content-hub.html': 'content-hub.html',
  '/pages/about-us': 'about.html',
  '/pages/about': 'about.html',
  '/about': 'about.html',
  '/about.html': 'about.html',
  '/pages/contact': 'contact.html',
  '/contact': 'contact.html',
  '/contact.html': 'contact.html',
  '/collections/party-pack': 'collection-party-pack.html',
  '/collection-party-pack': 'collection-party-pack.html',
  '/collection-party-pack.html': 'collection-party-pack.html',
  '/collections/colorfest': 'collection-colorfest.html',
  '/collection-colorfest': 'collection-colorfest.html',
  '/collection-colorfest.html': 'collection-colorfest.html',
  '/collections/all': 'shop.html',
  '/pages/faq': 'about.html',
  '/pages/terms-of-use': 'about.html',
  '/pages/privacy-policy': 'about.html',
  '/pages/marketing-policy': 'about.html'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/') && reqPath.length > 1) {
    reqPath = reqPath.slice(0, -1);
  }

  // Check explicit route mapping
  let targetFile = ROUTE_MAP[reqPath];

  // Dynamic fallback patterns
  if (!targetFile) {
    if (reqPath.startsWith('/products/')) {
      targetFile = 'product.html';
    } else if (reqPath.startsWith('/collections/')) {
      targetFile = 'shop.html';
    } else if (reqPath.startsWith('/pages/')) {
      const pageName = reqPath.replace('/pages/', '') + '.html';
      if (fs.existsSync(path.join(__dirname, pageName))) {
        targetFile = pageName;
      }
    }
  }

  let filePath = targetFile 
    ? path.join(__dirname, targetFile)
    : path.join(__dirname, reqPath);

  if (!fs.existsSync(filePath)) {
    // Try adding .html
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found - Page: ' + reqPath);
    }
  }

  if (fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('500 Server Error');
    }
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Ring Pop Carbon Copy server active at http://localhost:${PORT}`);
});

