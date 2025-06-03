// src/routes/user.routes.js
const express = require('express');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validation.middleware');
const { createUserSchema } = require('../validators/user.validator');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware'); // Lo usaremos en futuras solicitudes

const router = express.Router();

// Ruta para crear un nuevo usuario (puede ser solo para administradores en un sistema real,
// pero por ahora la dejamos abierta para pruebas iniciales)
router.get('/', authenticateToken, userController.getAllUsers);
router.post('/', validate(createUserSchema), userController.createUser);

// Rutas protegidas que requieren autenticación
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser); // Actualizar perfil
router.patch('/:id/status', authenticateToken, userController.changeUserStatus); // Cambiar estado del usuario

module.exports = router;