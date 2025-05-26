const express = require('express');
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/usuario-asignatura.controller');

const router = express.Router();
router.use(auth);

// Inscribir a una asignatura: { asignaturaId }
router.post('/inscribir', ctrl.inscribir);
// Obtener asignaturas inscritas
router.get('/', ctrl.listar);

module.exports = router;