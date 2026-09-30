const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

const fileCache = new Map();

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  const safePath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(ROOT, safePath);

  // Check if direct file exists, or check clean URLs with .html extension, or check directory index.html
  function resolveFilePath(targetPath) {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isFile()) return { path: targetPath, stats };
      if (stats.isDirectory()) {
        const indexInDir = path.join(targetPath, 'index.html');
        if (fs.existsSync(indexInDir) && fs.statSync(indexInDir).isFile()) {
          return { path: indexInDir, stats: fs.statSync(indexInDir) };
        }
      }
    }
    // Clean URL resolution: /admin -> admin.html
    const withHtml = targetPath + '.html';
    if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
      return { path: withHtml, stats: fs.statSync(withHtml) };
    }
    return null;
  }

  const resolved = resolveFilePath(filePath);

  if (!resolved) {
    const notFoundPage = path.join(ROOT, '404.html');
    if (fs.existsSync(notFoundPage)) {
      fs.readFile(notFoundPage, (err, data) => {
        if (!err) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(data);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      });
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const targetFile = resolved.path;
  const targetStats = resolved.stats;
  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Fast memory caching for static assets < 2MB
  if (targetStats.size < 2 * 1024 * 1024) {
    if (fileCache.has(targetFile)) {
      const cached = fileCache.get(targetFile);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': cached.length,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(cached);
      return;
    }

    fs.readFile(targetFile, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
        return;
      }
      fileCache.set(targetFile, data);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });
      res.end(data);
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': contentType });
  const stream = fs.createReadStream(targetFile);
  stream.pipe(res);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Server Error');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Timber Lights Server running at http://localhost:${PORT}`);
});
