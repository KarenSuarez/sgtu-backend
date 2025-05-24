const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const solicitudController = require('../controllers/solicitud.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', solicitudController.crearSolicitud);
router.get('/estudiante/:estudianteId', solicitudController.obtenerSolicitudesPorEstudiante);
router.patch('/:id/estado', solicitudController.actualizarEstadoSolicitud);

module.exports = router;
