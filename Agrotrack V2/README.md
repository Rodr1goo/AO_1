# 🌾 AgroTrack V2 — Programación Web II

Versión 2.0 del proyecto **AgroTrack**, desarrollada como parte de la **Actividad Obligatoria 2**.  
Implementa un servidor **Express .js** con API REST y conexión a **MySQL**.

---

## 🚀 Características

- Servidor **Express** (puerto configurable por `.env`).
- Archivos estáticos servidos desde `/public`.
- Endpoints REST para **contactos**.
- Middleware de **logger** y **manejo de errores**.
- Conexión a **MySQL** mediante `mysql2` y variables de entorno (`dotenv`).
- Colección **Postman** incluida.

---

## ⚙️ Configuración del entorno

1. Instalar dependencias:

   ```bash
   npm install


## Creamos el archivo .env a partir del .env.example

PORT=8888
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=agrotrack


## Crear la base de datos desde sql/schema.sql

CREATE DATABASE IF NOT EXISTS agrotrack;
USE agrotrack;

CREATE TABLE IF NOT EXISTS contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);


## Iniciar el sv

npm start


## Rutas principales

| Método   | Ruta             | Descripción                            |
| -------- | ---------------- | -------------------------------------- |
| **GET**  | `/`              | Página principal (`index.html`)        |
| **GET**  | `/health`        | Estado del servidor                    |
| **GET**  | `/login`         | Muestra formulario de inicio de sesión |
| **POST** | `/login`         | Valida usuario y clave (simulado)      |
| **GET**  | `/api/contactos` | Lista todos los contactos              |
| **POST** | `/api/contactos` | Agrega un nuevo contacto               |


🧪 Colección Postman

Archivo: Agrotrack V2.postman_collection.json
Incluye ejemplos de:

GET /api/contactos

POST /api/contactos

POST /login

GET /health


👨‍💻 Autor

Rodrigo Flores
Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas — IUA
Año 2025

## Estructura del proyecto

Agrotrack V2/
├── middleware/
│   ├── logger.js
│   └── errorHandler.js
├── public/
│   ├── index.html
│   ├── contacto.html
│   ├── productos.html
│   └── login.html
├── routes/
│   └── contactos.js
├── sql/
│   └── schema.sql
├── app.js
├── db.js
├── .env.example
├── package.json
└── README.md

📦 Versión: 2.0
🗓️ Fecha: Noviembre 2025