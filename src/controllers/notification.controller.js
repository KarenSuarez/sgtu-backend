// src/controllers/notification.controller.js
const NotificationModel = require('../models/mongo/notification.model'); // Asumiendo que el modelo ya se usa para guardar
const { sendSuccess, sendError } = require('../utils/response');

const notificationController = {
    // Método para obtener notificaciones de un usuario (ej. para un centro de notificaciones en el frontend)
    async getNotificationsByUser(req, res) {
        try {
            const userId = req.params.userId || req.user.id; // Obtener por parámetro o del usuario autenticado
            const { page = 1, limit = 10, readStatus } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);

            const query = { recipientId: userId };
            if (readStatus !== undefined) {
                query.read = readStatus === 'true'; // Filtrar por leído/no leído
            }

            const notifications = await NotificationModel.find(query)
                                                         .sort({ creationDate: -1 }) // Más recientes primero
                                                         .skip(skip)
                                                         .limit(parseInt(limit));
            
            const total = await NotificationModel.countDocuments(query);

            sendSuccess(res, {
                notifications,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }, 'Notificaciones obtenidas exitosamente');
        } catch (error) {
            console.error('Error en notificationController.getNotificationsByUser:', error.message);
            sendError(res, error.message, 500);
        }
    },

    // Método para marcar una notificación como leída
    async markNotificationAsRead(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // El usuario autenticado

            const notification = await NotificationModel.findOneAndUpdate(
                { _id: id, recipientId: userId }, // Solo el destinatario puede marcarla como leída
                { read: true },
                { new: true } // Devuelve el documento actualizado
            );

            if (!notification) {
                return sendError(res, 'Notificación no encontrada o no tienes permiso.', 404);
            }
            sendSuccess(res, notification, 'Notificación marcada como leída');
        } catch (error) {
            console.error('Error en notificationController.markNotificationAsRead:', error.message);
            sendError(res, error.message, 500);
        }
    }

    // Podrías añadir un endpoint para enviar notificaciones manuales (solo para admin)
};

module.exports = notificationController;