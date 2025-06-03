// src/routes/report.routes.js
const express = require('express');
const reportController = require('../controllers/report.controller');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware'); // Se usará en futura solicitud

const router = express.Router();

// Ruta para generar y exportar reportes
// GET /api/reports?type=SYSTEM_AUDIT&format=JSON&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/', authenticateToken, reportController.generateReport);

module.exports = router;