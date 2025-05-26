// src/routes/solicitud.routes.js
const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const solicitudController = require('../controllers/solicitud.controller');

const router = express.Router();

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

// Crear una nueva solicitud de tutoría:
// body: { asignaturaId, mensaje? }
router.post('/', solicitudController.crearSolicitud);

// Obtener las solicitudes del estudiante autenticado:
router.get('/', solicitudController.obtenerSolicitudesPorEstudiante);

// Cambiar el estado de una solicitud (solo ID en path):
// body: { estado }
router.patch('/:id/estado', solicitudController.actualizarEstadoSolicitud);

module.exports = router;
