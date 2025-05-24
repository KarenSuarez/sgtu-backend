const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const horarioController = require('../controllers/horario.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', horarioController.crearHorario.bind(horarioController));
router.get('/', horarioController.obtenerHorarios.bind(horarioController));
router.get('/:id', horarioController.obtenerHorarioPorId.bind(horarioController));
router.put('/:id', horarioController.actualizarHorario.bind(horarioController));
router.delete('/:id', horarioController.eliminarHorario.bind(horarioController));

module.exports = router;
