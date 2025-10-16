const http = require('http');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const { URL } = require('url');

const puerto = process.env.PORT || 8888;
const carpetaPublica = path.join(__dirname, 'public');
const carpetaData = path.join(__dirname, 'data');
const archivoContactos = path.join(carpetaData, 'contactos.txt');

function enviarHtml(res, estado, html) {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

async function leerIndex() {
  try {
    const rutaIndex = path.join(carpetaPublica, 'index.html');
    const contenido = await fs.readFile(rutaIndex);
    return { ok: true, contenido, bytes: contenido.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function asegurarData() {
  if (!fssync.existsSync(carpetaData)) await fs.mkdir(carpetaData, { recursive: true });
  if (!fssync.existsSync(archivoContactos)) await fs.writeFile(archivoContactos, '', 'utf8');
}

async function leerCuerpo(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const raw = Buffer.concat(chunks).toString('utf8');
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    try { return JSON.parse(raw || '{}'); } catch { return {}; }
  }
  const params = new URLSearchParams(raw);
  const obj = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

const HTML_INLINE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>AgroTrack | Inicio (inline)</title></head>
<body>
  <h1>AgroTrack — Inline</h1>
  <p>Este HTML viene embebido desde el server (fallback).</p>
  <nav>
    <a href="/productos.html">Productos</a> ·
    <a href="/contacto">Contacto</a> ·
    <a href="/login">Login (demo)</a> ·
    <a href="/tabla?num=5">Tabla (num=5)</a>
  </nav>
</body></html>`;

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ruta = decodeURIComponent(url.pathname);

    // HOME: lee /public/index.html; si no, fallback inline
    if (req.method === 'GET' && (ruta === '/' || ruta === '' || ruta === '/index' || ruta === '/index/')) {
      const info = await leerIndex();
      if (info.ok && info.bytes > 20) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      return enviarHtml(res, 200, HTML_INLINE);
    }

    // /index.html directo
    if (req.method === 'GET' && ruta === '/index.html') {
      const info = await leerIndex();
      if (info.ok) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      return enviarHtml(res, 404, '<h1>404</h1><p>No se encontró public/index.html</p>');
    }

    // Páginas base
// GET /login
if (req.method === 'GET' && ruta === '/login') {
  try {
    const p = path.join(carpetaPublica, 'login.html');
    const html = await fs.readFile(p, 'utf8');
    if (!html.trim()) return enviarHtml(res, 200, '<h1>login.html está vacío</h1><p>Agregá contenido y guardá.</p>');
    return enviarHtml(res, 200, html);
  } catch {
    return enviarHtml(res, 404, '<h1>404</h1><p>login.html no encontrado</p><p><a href="/">Inicio</a></p>');
  }
}

// GET /contacto
if (req.method === 'GET' && ruta === '/contacto') {
  try {
    const p = path.join(carpetaPublica, 'contacto.html');
    const html = await fs.readFile(p, 'utf8');
    return enviarHtml(res, 200, html);
  } catch {
    return enviarHtml(res, 404, '<h1>404</h1><p>contacto.html no encontrado</p><p><a href="/">Inicio</a></p>');
  }
}

// GET /productos.html
if (req.method === 'GET' && ruta === '/productos.html') {
  try {
    const p = path.join(carpetaPublica, 'productos.html');
    const html = await fs.readFile(p, 'utf8');
    if (!html.trim()) return enviarHtml(res, 200, '<h1>productos.html está vacío</h1><p>Agregá contenido y guardá.</p>');
    return enviarHtml(res, 200, html);
  } catch {
    return enviarHtml(res, 404, '<h1>404</h1><p>productos.html no encontrado</p><p><a href="/">Inicio</a></p>');
  }
}

// GET /tabla?num=5  (demo de query string)
if (req.method === 'GET' && ruta === '/tabla') {
  const num = Number(url.searchParams.get('num'));
      if (!num || Number.isNaN(num)) {
        return enviarHtml(res, 400, `
          <h1>Parámetro inválido</h1>
          <p>Usá <code>/tabla?num=5</code> (ejemplo).</p>
          <p><a href="/">Volver</a></p>
        `);
      }
      const filas = Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        return `<tr><td>${num}</td><td>x</td><td>${n}</td><td>=</td><td>${num * n}</td></tr>`;
      }).join('');
      return enviarHtml(res, 200, `
        <h1>Tabla del ${num}</h1>
        <nav>
          <a href="/">Inicio</a> · <a href="/contacto">Contacto</a> · <a href="/login">Login</a>
        </nav>
        <table border="1" cellpadding="6"><tbody>${filas}</tbody></table>
      `);
    }

    // POST /auth/recuperar (login demo)
    if (req.method === 'POST' && ruta === '/auth/recuperar') {
      const { email, password } = await leerCuerpo(req);
      if (!email || !password) {
        return enviarHtml(res, 400, `<h1>Faltan datos</h1><p><a href="/login">Volver</a></p>`);
      }
      return enviarHtml(res, 200, `
        <h1>Login demo OK</h1>
        <p>Email: <b>${email}</b></p>
        <p>Pass (demo): <code>${password}</code></p>
        <p><a href="/login">Volver</a></p>
      `);
    }

    // POST /contacto/cargar
    if (req.method === 'POST' && ruta === '/contacto/cargar') {
      await asegurarData();
      const { nombre, email, mensaje } = await leerCuerpo(req);
      if (!nombre || !email || !mensaje) {
        return enviarHtml(res, 400, `<h1>Faltan datos</h1><p><a href="/contacto">Volver</a></p>`);
      }
      const linea = `${new Date().toISOString()};${nombre};${email};${String(mensaje).replace(/\s+/g,' ').trim()}\n`;
      await fs.appendFile(archivoContactos, linea, 'utf8');
      return enviarHtml(res, 201, `
        <h1>Contacto recibido</h1>
        <p>Gracias, ${nombre}. Responderemos a ${email}.</p>
        <p><a href="/contacto">Volver</a> · <a href="/contacto/listar">Ver contactos</a></p>
      `);
    }

    // GET /contacto/listar
    if (req.method === 'GET' && ruta === '/contacto/listar') {
      await asegurarData();
      const contenido = await fs.readFile(archivoContactos, 'utf8');
      const filas = contenido.trim() ? contenido.trim().split('\n') : [];
      const trs = filas.map(l => {
        const [fecha, nombre, email, mensaje] = l.split(';');
        return `<tr><td>${fecha}</td><td>${nombre}</td><td>${email}</td><td>${mensaje}</td></tr>`;
      }).join('');
      return enviarHtml(res, 200, `
        <h1>Contactos</h1>
        <nav>
          <a href="/">Inicio</a> · <a href="/productos.html">Productos</a> ·
          <a href="/contacto">Contacto</a> · <a href="/login">Login</a>
        </nav>
        <table border="1" cellpadding="6">
          <thead><tr><th>Fecha</th><th>Nombre</th><th>Email</th><th>Mensaje</th></tr></thead>
          <tbody>${trs || '<tr><td colspan="4"><i>Sin registros</i></td></tr>'}</tbody>
        </table>
      `);
    }

    // Cualquier otro .html dentro de /public
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
