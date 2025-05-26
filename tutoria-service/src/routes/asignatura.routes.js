    const express = require('express');
    const authMiddleware = require('../middleware/auth.middleware');
    const asignaturaController = require('../controllers/asignatura.controller');

    const router = express.Router();

    router.use(authMiddleware); // Protege todas las rutas debajo

    router.get('/', asignaturaController.getAll.bind(asignaturaController));
    router.get('/:id', asignaturaController.getById.bind(asignaturaController));
    router.post('/', asignaturaController.create.bind(asignaturaController));
    router.put('/:id', asignaturaController.update.bind(asignaturaController));
    router.delete('/:id', asignaturaController.delete.bind(asignaturaController));

    module.exports = router;
