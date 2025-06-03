// src/routes/log.routes.js
const express = require('express');
const logController = require('../controllers/log.controller');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware'); // Se usará en futura solicitud

const router = express.Router();

// Ruta para obtener logs (solo para administradores/auditores)
router.get('/', authenticateToken, logController.getLogs);

// Ruta para generar un informe de auditoría (por rango de fechas)
router.get('/report', authenticateToken, logController.generateAuditReport);

module.exports = router;