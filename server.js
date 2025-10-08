const http = require('http');

const PORT = process.env.PORT || 8888;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>AgroTrack</title></head>
<body>
  <h1>AgroTrack — Node puro</h1>
  <p>Servidor andando ok</p>
  <p>Ruta solicitada: <code>${req.url}</code></p>
</body></html>`);
});

server.listen(PORT, () => {
  console.log(`AgroTrack leyendo a http://localhost:${PORT}/`);
});
