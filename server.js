const http = require('http');
const fs = require('fs').promises;  // API asíncrona de FS (fs.readFile, fs.appendFile, etc.)
const fssync = require('fs');       // API síncrona (solo para existsSync)
const path = require('path');
const { URL } = require('url');

// ---------- Configuración de paths y puerto ----------

const puerto = process.env.PORT || 8888;
const carpetaPublica = path.join(__dirname, 'public');


// aca se crea consultas.txt
// dentro de data/

const carpetaData = path.join(__dirname, 'data');
const archivoConsultas = path.join(carpetaData, 'consultas.txt');

// ---------- Helpers HTTP ----------
// Envía una respuesta HTML simple
function enviarHtml(res, estado, html) {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Lee index.html de forma asíncrona (si existe)

async function leerIndex() {
  try {
    const rutaIndex = path.join(carpetaPublica, 'index.html');
    const contenido = await fs.readFile(rutaIndex);
    return { ok: true, contenido, bytes: contenido.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Asegura carpeta data/ y archivo consultas.txt

async function asegurarData() {
  if (!fssync.existsSync(carpetaData)) {
    await fs.mkdir(carpetaData, { recursive: true });
  }
  if (!fssync.existsSync(archivoConsultas)) {
    await fs.writeFile(archivoConsultas, '', 'utf8');
  }
}

// Lee el cuerpo (POST) y lo convierte con URLSearchParams

async function leerCuerpo(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch); // lee todo el body
  // Buffer.concat(chunks) es un Buffer con todo el body
  // Lo convertimos a string (asumimos utf8)
  // Luego lo parseamos según content-type
  const raw = Buffer.concat(chunks).toString('utf8'); 

  const ct = req.headers['content-type'] || ''; 
  if (ct.includes('application/json')) {
    try { return JSON.parse(raw || '{}'); } catch { return {}; }
  }

  // Por defecto: x-www-form-urlencoded

  const params = new URLSearchParams(raw); // si raw es '' queda vacío
  const obj = {}; 
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

// Fecha local "YYYY-MM-DD HH:mm" (para consultas.txt)

function fechaLocalYYYYMMDD_HHMM() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// HTML fallback para "/" si index.html no existe o está vacío (evita "pantalla en blanco")

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
</body></html>`;    // aca tuve muchos errores a la hora de poder conectarlo con el servidor, el chat me ayudo a resolverlos realizando estas lineas de codigo

// ===============================
// Servidor HTTP y ruteo manual
// ===============================
const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ruta = decodeURIComponent(url.pathname);

    // ---------------------------
    // 1) Servidor base (GET /)
    // Mostrar index.html (o fallback)
    // ---------------------------
    if (req.method === 'GET' && (ruta === '/' || ruta === '' || ruta === '/index' || ruta === '/index/')) { // aceptar varias formas de / esto es lo que me ayudo a resolver el chat
      const info = await leerIndex();
      if (info.ok && info.bytes > 20) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      return enviarHtml(res, 200, HTML_INLINE); // fallback si falta index o está vacío
    }

    // Acceso directo a /index.html
    if (req.method === 'GET' && ruta === '/index.html') {
      const info = await leerIndex();
      if (info.ok) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(info.contenido);
      }
      return enviarHtml(res, 404, '<h1>404</h1><p>No se encontró public/index.html</p>');
    }

    // ---------------------------
    // 2) Login de demostración
    // GET /login  → muestra formulario (HTML)
    // POST /auth/recuperar → procesa y devuelve "Usuario / Clave"
    // ---------------------------
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

    if (req.method === 'POST' && ruta === '/auth/recuperar') {  
      const body = await leerCuerpo(req);
      const usuario = body.usuario || body.email; // aceptar "usuario" o "email"
      const clave   = body.clave   || body.password; // aceptar "clave" o "password"

      if (!usuario || !clave) {
        return enviarHtml(res, 400, `<h1>Faltan datos</h1><p><a href="/login">Volver</a></p>`);
      }

      return enviarHtml(res, 200, `
        <h1>Datos recibidos</h1>
        <p>Usuario: <b>${usuario}</b></p>
        <p>Clave: <b>${clave}</b></p>
        <p><a href="/login">Volver</a></p>
      `);
    }

    // ---------------------------
    // 3) Formulario de contacto
    // GET /contacto → HTML
    // POST /contacto/cargar → guarda en data/consultas.txt
    // GET /contacto/listar → muestra el contenido dentro de <pre>
    // ---------------------------
    if (req.method === 'GET' && ruta === '/contacto') {
      try {
        const p = path.join(carpetaPublica, 'contacto.html');
        const html = await fs.readFile(p, 'utf8');
        return enviarHtml(res, 200, html);
      } catch {
        return enviarHtml(res, 404, '<h1>404</h1><p>contacto.html no encontrado</p><p><a href="/">Inicio</a></p>');
      }
    }

    if (req.method === 'POST' && ruta === '/contacto/cargar') {
      await asegurarData(); // crea data/ y consultas.txt si no existen

      const { nombre, email, mensaje } = await leerCuerpo(req);
      if (!nombre || !email || !mensaje) {
        return enviarHtml(res, 400, `<h1>Faltan datos</h1><p><a href="/contacto">Volver</a></p>`);
      }

      // Bloque legible para consultas.txt 
      const bloque = [
        '-------------------------',
        `Fecha: ${fechaLocalYYYYMMDD_HHMM()}`,
        `Nombre: ${String(nombre).trim()}`,
        `Email: ${String(email).trim()}`,
        `Mensaje: ${String(mensaje).trim()}`,
        '-------------------------',
        ''
      ].join('\n'); // \n al final para separar bloques

      await fs.appendFile(archivoConsultas, bloque, 'utf8'); // guarda al final (crea si no existe)

      return enviarHtml(res, 201, ` 
        <h1>Contacto recibido</h1>
        <p>Gracias, ${nombre}. Responderemos a ${email}.</p>
        <p><a href="/contacto">Volver</a> · <a href="/contacto/listar">Ver consultas</a></p>
      `);
    }

    if (req.method === 'GET' && ruta === '/contacto/listar') {
      await asegurarData();
      const contenido = await fs.readFile(archivoConsultas, 'utf8');
      const limpio = contenido.trim();

      // si no hay consultas,  se muestra un mensaje
      const cuerpo = limpio
        ? `<pre>${limpio.replace(/</g,'&lt;')}</pre>` // escapo < para no romper el HTML si lo escribieron (aca se me rompia el codigo tmb)
        : `<p><i>Aún no hay consultas</i></p>`;

      return enviarHtml(res, 200, `
        <h1>Consultas</h1>
        <nav>
          <a href="/">Inicio</a> · <a href="/productos.html">Productos</a> ·
          <a href="/contacto">Contacto</a> · <a href="/login">Login</a>
        </nav>
        ${cuerpo}
      `);
    }

    // ---------------------------
    // Extra: GET con query string (/tabla?num=5)
    // ---------------------------
    if (req.method === 'GET' && ruta === '/tabla') {
      const num = Number(url.searchParams.get('num')); 
      if (!num || Number.isNaN(num)) { 
        return enviarHtml(res, 400, `
          <h1>Parámetro inválido</h1>
          <p>Usá <code>/tabla?num=5</code> (ejemplo).</p>
          <p><a href="/">Volver</a></p>
        `);
      }
      const filas = Array.from({ length: 10 }, (_, i) => { // crea 10 filas
        const n = i + 1; // para cada i se calcula n = i + 1 y genera fila html
        return `<tr><td>${num}</td><td>x</td><td>${n}</td><td>=</td><td>${num * n}</td></tr>`;
      }).join(''); // une todas las filas en un solo string
      return enviarHtml(res, 200, ` 
        <h1>Tabla del ${num}</h1>
        <nav>
          <a href="/">Inicio</a> · <a href="/contacto">Contacto</a> · <a href="/login">Login</a>
        </nav>
        <table border="1" cellpadding="6"><tbody>${filas}</tbody></table>
      `); // devuelve el html con la tabla hecha
    }

    // ---------------------------
    // BLOQUE PARA QUE CUALQUIER GET CON URL QUE TERMINE EN .HTML LEA EN PUBLIC Y LO DEVUELVA
    // Tuve varios problemas para poder hacer funcionar lo que pedía la guía.
    // ---------------------------
    if (req.method === 'GET' && ruta.endsWith('.html')) {
      const relativa = ruta.startsWith('/') ? ruta.slice(1) : ruta;
      try {
        const archivo = path.join(carpetaPublica, relativa);
        const contenido = await fs.readFile(archivo);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(contenido);
      } catch {
        return enviarHtml(res, 404, '<h1>404</h1><p>Recurso no encontrado</p><p><a href="/">Inicio</a></p>');
      }
    }

    // ---------------------------
    // 404 — Ruta no definida
    // ---------------------------
    return enviarHtml(res, 404, '<h1>404</h1><p>Ruta no definida</p><p><a href="/">Inicio</a></p>');

  } catch (e) {
    // 500 — Error interno
    console.error(e);
    return enviarHtml(res, 500, '<h1>500</h1><p>Error del servidor</p>');
  }
});

// ---------- Inicio del servidor ----------
servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}/`);
});
