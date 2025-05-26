// src/routes/tutoria.routes.js
const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const tutoriaController = require('../controllers/tutoria.controller');

const router = express.Router();

router.use(authMiddleware);

// Agendar una tutoría:
// body: { solicitudId, fecha, horaInicio, horaFin }
router.post('/', tutoriaController.crearTutoria);

// Listar tutorías del docente autenticado:
router.get('/', tutoriaController.obtenerTutoriasPorDocente);

// Cancelar una tutoría por su ID
router.delete('/:id', tutoriaController.cancelarTutoria);

module.exports = router;
