const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const calendarioController = require('../controllers/calendario.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', calendarioController.crearEvento);
router.get('/tutor/:tutorId', calendarioController.obtenerEventosPorTutor);
router.patch('/:id/estado', calendarioController.actualizarEstadoEvento);
router.delete('/:id', calendarioController.eliminarEvento);

module.exports = router;
