// routes/contactos.js
const express = require('express')
const router = express.Router()
const db = require('../db')   // Importamos la conexión existente

// GET /api/contactos → Listar
router.get('/', function (req, res) {
    const sql = 'SELECT * FROM contactos ORDER BY fecha DESC'

    db.query(sql, function (error, resultados) {
        if (error) {
            console.log('Error en consulta:', error)
            return res.status(500).json({ error: 'Error al obtener los contactos' })
        }
        res.json(resultados)
    })
})

// POST /api/contactos → Guardar
router.post('/', function (req, res) {
    const nombre = req.body.nombre
    const email = req.body.email
    const mensaje = req.body.mensaje

    // Validaciones básicas
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' })
    }

    const sql = 'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)'
    const valores = [nombre, email, mensaje]

    db.query(sql, valores, function (error) {
        if (error) {
            console.log('Error al insertar:', error)
            return res.status(500).json({ error: 'No se pudo guardar el contacto' })
        }
        res.status(201).json({ mensaje: 'Contacto guardado correctamente' })
    })
})

module.exports = router
