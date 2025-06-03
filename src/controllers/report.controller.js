// src/controllers/report.controller.js
const reportService = require('../services/report.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ReportType = require('../enums/report-type.enum');
const ReportFormat = require('../enums/report-format.enum');
const ActionType = require('../enums/action-type.enum');

const reportController = {
    async generateReport(req, res) {
        try {
            const { type, format = ReportFormat.JSON, startDate, endDate, studentId, teacherId } = req.query; // Filters

            // Validar que el tipo de reporte y formato sean válidos
            if (!Object.values(ReportType).includes(type)) {
                return sendError(res, `Tipo de reporte '${type}' no válido.`, 400);
            }
            if (!Object.values(ReportFormat).includes(format)) {
                return sendError(res, `Formato de exportación '${format}' no válido.`, 400);
            }

            // Validar fechas para reportes basados en rango de tiempo
            if ([ReportType.SYSTEM_AUDIT, ReportType.TUTORINGS_COMPLETED].includes(type) && (!startDate || !endDate)) {
                return sendError(res, 'Las fechas de inicio y fin son obligatorias para este tipo de reporte.', 400);
            }

            const filters = { startDate, endDate, studentId, teacherId };

            // Generar los datos crudos del reporte
            const reportData = await reportService.generateReportData(type, filters);

            // Exportar los datos al formato deseado
            const buffer = await reportService.exportReport(reportData, format, type);

            // Registrar la acción
            await logService.registerAction(req.user.id, req.user.email, ActionType.GENERATE_REPORT, { reportType: type, format: format, filters: filters }, req);

            // Configurar headers para la descarga
            res.setHeader('Content-Disposition', `attachment; filename=${type}.${format.toLowerCase()}`);
            
            switch (format) {
                case ReportFormat.JSON:
                    res.setHeader('Content-Type', 'application/json');
                    break;
                case ReportFormat.CSV:
                    res.setHeader('Content-Type', 'text/csv');
                    break;
                case ReportFormat.EXCEL:
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    break;
                case ReportFormat.PDF:
                    res.setHeader('Content-Type', 'application/pdf');
                    break;
            }
            
            res.send(buffer);

        } catch (error) {
            console.error('Error en reportController.generateReport:', error);
            sendError(res, error.message, 500);
        }
    }
    // No es necesario un controlador getReport si exportReport ya devuelve el archivo
};

module.exports = reportController;