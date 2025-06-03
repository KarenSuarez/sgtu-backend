// src/routes/auth.routes.js
const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const { loginSchema } = require('../validators/auth.validator');
const authenticateToken = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser); // Obtener el usuario autenticado

module.exports = router;