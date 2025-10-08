const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

const puerto = process.env.PORT || 8888;
const carpetaPublica = path.join(__dirname, 'public');

// Enviar una respuesta HTML con estado
function enviarHtml(res, estado, html) {
  res.writeHead(estado, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// Esta funcion lee y devuelve un archivo .html dentro de /public
async function servirHtml(res, rutaRelativa) {
  try {
    if (rutaRelativa.includes('..')) throw new Error('ruta no válida'); // por seguridad
    const rutaArchivo = path.join(carpetaPublica, rutaRelativa);
    const contenido = await fs.readFile(rutaArchivo);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(contenido);
  } catch {
    enviarHtml(res, 404, '<h1>404</h1><p>Recurso no encontrado</p><p><a href="/">Volver al inicio</a></p>');
  }
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ruta = decodeURIComponent(url.pathname);



    // Inicio del index

   if (req.method === 'GET' && (ruta === '/' || ruta === '' || ruta === '/index' || ruta === '/index/')) {
      return servirHtml(res, 'index.html');
    }

    // Cualquier otro HTML dentro de la carpeta public
    if (req.method === 'GET' && ruta.endsWith('.html')) {
      const relativa = ruta.startsWith('/') ? ruta.slice(1) : ruta;
      return servirHtml(res, relativa);
    }

    // Aún no definimos más rutas
    return enviarHtml(res, 404, '<h1>404</h1><p>Ruta no definida</p><p><a href="/">Inicio</a></p>');
  } catch (error) {
    console.error(error);
    return enviarHtml(res, 500, '<h1>500</h1><p>Error del servidor</p><p><a href="/">Inicio</a></p>');
  }
});

servidor.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}/`);
});
