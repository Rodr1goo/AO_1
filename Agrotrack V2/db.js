
//  Conexión a MySQL - AgroTrack V2

require('dotenv').config();
const mysql = require('mysql2');

// Crear conexión usando variables del .env
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// Conectar y mostrar estado
db.connect((err) => {
  if (err) {
    console.error('Error al conectar con MySQL:', err.message);
  } else {
    console.log('Conexión a MySQL establecida correctamente');
  }
});

module.exports = db;
