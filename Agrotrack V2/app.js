// ============================
//  AGROTRACK V2 - Servidor Express
// ============================

require('dotenv').config(); // Carga variables desde .env
const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const contactosRouter = require('./routes/contactos');

// Crear la aplicación Express
const app = express();

// Puerto configurado en .env o 3000 por defecto
const PORT = process.env.PORT || 3000;

// ============================
//  Middleware globales
// ============================

// Permite interpretar JSON en las solicitudes POST
app.use(express.json());

// Permite interpretar datos de formularios (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Middleware de logger (para ver peticiones en consola)
app.use(logger);

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// ============================
//  Rutas principales
// ============================

// Página principal (GET /)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint de verificación
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================
//  Login simulado (sin base de datos)
// ============================
app.post('/login', (req, res) => {
  const { usuario, clave } = req.body;

  if (!usuario || !clave) {
    return res.status(400).send('Faltan credenciales');
  }

  // Inicio de sesión simulado
  if (usuario.toLowerCase() === 'admin' && clave === '1234') {
    return res.status(200).send('Bienvenido Admin!');
  } else {
    return res.status(401).send('Usuario o clave incorrectos');
  }
});



// Rutas de la API (contactos)
app.use('/api/contactos', contactosRouter);

// ============================
//  Middleware de errores
// ============================
app.use(errorHandler);

// ============================
//  Arrancar el servidor
// ============================
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
