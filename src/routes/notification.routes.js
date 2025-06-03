// src/routes/notification.routes.js
const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware'); // Para uso futuro

const router = express.Router();

// Obtener notificaciones para el usuario autenticado
router.get('/me', authenticateToken, notificationController.getNotificationsByUser);

// Obtener notificaciones de un usuario específico (para admins)
router.get('/:userId', authenticateToken, notificationController.getNotificationsByUser);

// Marcar notificación como leída
router.patch('/:id/read', authenticateToken, notificationController.markNotificationAsRead);

module.exports = router;