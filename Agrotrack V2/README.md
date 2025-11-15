# 🌾 AgroTrack V2 — Programación Web II

Versión 2.0 del proyecto **AgroTrack**, desarrollada como parte de la **Actividad Obligatoria 2**.  
Implementa un servidor **Express .js** con API REST y conexión a **MySQL**.

---

## Características principales

- Servidor **Express.js** con puerto configurable vía `.env`.
- Archivos estáticos servidos desde la carpeta **/public**.
- API REST para gestionar **contactos**.
- Middleware de:
  -  Logger de peticiones  
  -  Manejador de errores
- Conexión a **MySQL** utilizando `mysql2`.
- Variables de entorno con `dotenv`.
- Colección **Postman** incluida con pruebas reales de la API.
- Validaciones y manejo de estados HTTP.

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

## El servidor iniciará en:

http://localhost:8888



## Rutas principales

| Método   | Ruta             | Descripción                            |
| -------- | ---------------- | -------------------------------------- |
| **GET**  | `/`              | Página principal (`index.html`)        |
| **GET**  | `/health`        | Estado del servidor                    |
| **GET**  | `/login.html`    | Muestra formulario de inicio de sesión |
| **POST** | `/login`         | Valida usuario y clave (simulado)      |
| **GET**  | `/api/contactos` | Lista todos los contactos              |
| **POST** | `/api/contactos` | Agrega un nuevo contacto               |


 Colección Postman

Archivo: AgrotrackV2_RodrigoFlores_postman_collection.json
Incluye pruebas de:

✔ GET /health

✔ GET /api/contactos

✔ POST /api/contactos (válido)

✔ POST /api/contactos (inválido)

✔ POST /login

✔ GET /



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




Autor

Rodrigo Flores
Tecnicatura Universitaria en Desarrollo de Aplicaciones Informáticas — IUA
Año 2025

