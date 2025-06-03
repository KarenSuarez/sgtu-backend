// src/controllers/log.controller.js
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');

const logController = {
    async getLogs(req, res) {
        try {
            const { userId, userEmail, action, startDate, endDate, page = 1, limit = 20 } = req.query;

            const filters = { userId, userEmail, action, startDate, endDate };
            const parsedPage = parseInt(page);
            const parsedLimit = parseInt(limit);

            // TODO: En futuras solicitudes, implementar middleware de autorización para asegurar que solo admins o auditores puedan ver logs
            // if (req.user.role.name !== 'admin' && req.user.role.name !== 'auditor') {
            //     return sendError(res, 'No tienes permiso para consultar logs.', 403);
            // }

            const logs = await logService.consultLogs(filters, parsedPage, parsedLimit);
            sendSuccess(res, logs, 'Logs obtenidos exitosamente');
        } catch (error) {
            console.error('Error en logController.getLogs:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async generateAuditReport(req, res) {
        try {
            const { startDate, endDate } = req.query; // Formato YYYY-MM-DD para simplificar

            if (!startDate || !endDate) {
                return sendError(res, 'Las fechas de inicio y fin son obligatorias para el informe.', 400);
            }

            // TODO: En futuras solicitudes, añadir formatos de exportación (PDF/Excel)
            // Por ahora, solo devuelve los datos en JSON
            const reportData = await logService.generateAuditReport(startDate, endDate);
            sendSuccess(res, reportData, 'Informe de auditoría generado exitosamente');
        } catch (error) {
            console.error('Error en logController.generateAuditReport:', error.message);
            sendError(res, error.message, 500);
        }
    }
};

module.exports = logController;