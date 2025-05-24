const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const tutoriaController = require('../controllers/tutoria.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', tutoriaController.crearTutoria);
router.get('/docente/:docenteId', tutoriaController.obtenerTutoriasPorDocente);
router.delete('/:id', tutoriaController.cancelarTutoria);

module.exports = router;
