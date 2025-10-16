const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

const puerto = process.env.PORT || 8888;
const carpetaPublica = path.join(__dirname, 'public');

function enviarHtml(res, estado, html) {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function leerIndex() {
  try {
    const rutaIndex = path.join(carpetaPublica, 'index.html');
    const contenido = await fs.readFile(rutaIndex);
    return { ok: true, contenido, rutaIndex, bytes: contenido.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const HTML_INLINE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>AgroTrack | Inicio (inline)</title></head>
<body>
  <h1>AgroTrack — Inline</h1>
  <p>Este HTML viene embebido desde el server.</p>
  <nav>
    <a href="/productos.html">Productos</a> ·
    <a href="/contacto">Contacto</a> ·
    <a href="/login">Login (demo)</a>
  </nav>
  <p><a href="/debug/index">Diagnóstico de index</a></p>
</body></html>`;

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ruta = decodeURIComponent(url.pathname);
    console.log(req.method, ruta);

    // Salud
    if (req.method === 'GET' && ruta === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('OK');
    }

    // DEBUG: info sobre index.html
    if (req.method === 'GET' && ruta === '/debug/index') {
      const info = await leerIndex();
      if (!info.ok) {
        return enviarHtml(res, 200, `<h1>debug index</h1><p>No se pudo leer: <b>public/index.html</b></p><pre>${info.error}</pre>`);
      }
      return enviarHtml(res, 200, `<h1>debug index</h1>
        <p>Ruta: <code>${info.rutaIndex}</code></p>
        <p>Bytes: <b>${info.bytes}</b></p>
        <p><a href="/">Volver</a> · <a href="/index.html">/index.html</a></p>`);
    }

    // HOME: intenta leer public/index.html; si falla o es demasiado pequeño, muestra inline
    if (req.method === 'GET' && (ruta === '/' || ruta === '' || ruta === '/index' || ruta === '/index/')) {
      const info = await leerIndex();
      if (info.ok && info.bytes > 20) { // si el archivo existe y tiene contenido visible
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      // fallback garantizado
      return enviarHtml(res, 200, HTML_INLINE);
    }

    // /index.html directo (sirve para comparar)
    if (req.method === 'GET' && ruta === '/index.html') {
      const info = await leerIndex();
      if (info.ok) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      return enviarHtml(res, 404, '<h1>404</h1><p>No se encontró public/index.html</p>');
    }

    // Otros HTML dentro de /public
    if (req.method === 'GET' && ruta.endsWith('.html')) {
      const relativa = ruta.startsWith('/') ? ruta.slice(1) : ruta;
      try {
        const archivo = path.join(carpetaPublica, relativa);
        const contenido = await fs.readFile(archivo);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(contenido);
      } catch {
        return enviarHtml(res, 404, '<h1>404</h1><p>Recurso no encontrado</p>');
      }
    }

    // 404 por defecto
    return enviarHtml(res, 404, '<h1>404</h1><p>Ruta no definida</p><p><a href="/">Inicio</a></p>');
  } catch (e) {
    console.error(e);
    return enviarHtml(res, 500, '<h1>500</h1><p>Error del servidor</p>');
  }
});

servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}/`);
});
