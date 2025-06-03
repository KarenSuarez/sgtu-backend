// src/services/log.service.js
const LogEntry = require('../models/mongo/log.model');
const ActionType = require('../enums/action-type.enum');

const logService = {
    /**
     * Registra una acción en la base de datos de logs.
     * @param {number|null} userId - ID del usuario que realizó la acción. Nulo si es una acción del sistema.
     * @param {string|null} userEmail - Email del usuario que realizó la acción. Nulo si es una acción del sistema.
     * @param {ActionType} actionType - Tipo de acción realizada (usando el enum ActionType).
     * @param {object} details - Objeto con detalles adicionales de la acción.
     * @param {object|null} req - Objeto de solicitud Express para extraer IP y User-Agent.
     */
    async registerAction(userId, userEmail, actionType, details = {}, req = null) {
        try {
            const logData = {
                userId: userId,
                userEmail: userEmail,
                action: actionType,
                details: details,
            };

            if (req) {
                logData.ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
                logData.userAgent = req.headers['user-agent'];
            }

            const logEntry = new LogEntry(logData);
            await logEntry.save();
            // console.log(`Log registrado: [${actionType}] por ${userEmail || 'Sistema'} (ID: ${userId || 'N/A'})`);
        } catch (error) {
            console.error('Error al registrar log:', error);
            // Es crucial no lanzar el error aquí para no bloquear la operación principal
            // que intentaba registrar el log.
        }
    },

    /**
     * Consulta logs con filtros y paginación.
     * @param {object} filters - Objeto con filtros (userId, action, startDate, endDate, etc.).
     * @param {number} page - Número de página (base 1).
     * @param {number} limit - Límite de resultados por página.
     * @returns {Promise<object>} Objeto con logs, total, página y límite.
     */
    async consultLogs(filters = {}, page = 1, limit = 20) {
        const query = {};
        const skip = (page - 1) * limit;

        if (filters.userId) {
            query.userId = parseInt(filters.userId); // Asegura que sea número
        }
        if (filters.userEmail) {
            query.userEmail = { $regex: filters.userEmail, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
        }
        if (filters.action) {
            // Permitir buscar por un tipo de acción específico o un array de tipos
            query.action = Array.isArray(filters.action) ? { $in: filters.action } : filters.action;
        }
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate) {
                query.timestamp.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.timestamp.$lte = new Date(filters.endDate);
            }
        }
        // Si se añaden resourceId/resourceType, añadir filtros aquí

        try {
            const logs = await LogEntry.find(query)
                                        .sort({ timestamp: -1 }) // Ordenar por fecha descendente (más recientes primero)
                                        .skip(skip)
                                        .limit(limit)
                                        .lean(); // Devolver objetos JS planos, más rápidos si no se van a modificar

            const total = await LogEntry.countDocuments(query);

            return {
                logs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error al consultar logs:', error);
            throw new Error('No se pudieron consultar los logs.');
        }
    },

    /**
     * Genera un informe de auditoría básico (simplemente consulta logs con un rango de fechas).
     * En futuras solicitudes, esto podría ser más complejo (agregaciones, exportaciones).
     * @param {Date} startDate - Fecha de inicio del informe.
     * @param {Date} endDate - Fecha de fin del informe.
     * @returns {Promise<Array>} Lista de logs para el período.
     */
    async generateAuditReport(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Se requiere un rango de fechas para el informe de auditoría.');
        }
        const logs = await this.consultLogs({
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        }, 1, 1000); // Consulta hasta 1000 logs para el informe
        return logs.logs;
    },

    /**
     * Genera un informe de auditoría obteniendo logs dentro de un rango de fechas.
     * @param {string} startDate - Fecha de inicio (ej. 'YYYY-MM-DD').
     * @param {string} endDate - Fecha de fin (ej. 'YYYY-MM-DD').
     * @returns {Promise<Array>} Lista de objetos de log para el período.
     */
    async getAuditLogsForReport(startDate, endDate) { // Renombrado para mayor claridad
        if (!startDate || !endDate) {
            throw new Error('Se requiere un rango de fechas para el informe de auditoría.');
        }

        const query = {
            timestamp: {
                $gte: new Date(startDate),
                $lte: new Date(`${endDate}T23:59:59.999`) // Incluir todo el día final
            }
        };

        try {
            const logs = await LogEntry.find(query)
                                        .sort({ timestamp: 1 }) // Ordenar por fecha ascendente para el reporte
                                        .lean();
            return logs;
        } catch (error) {
            console.error('Error al obtener logs para el informe de auditoría:', error.message);
            throw new Error('No se pudieron obtener los logs para el informe.');
        }
    }
};

module.exports = logService;