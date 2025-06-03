// src/services/report.service.js
const ExcelJS = require('exceljs'); // Para Excel
const PDFDocument = require('pdfkit'); // Para PDF (pdfkit es una buena opción)
const logService = require('./log.service');
const Tutoring = require('../models/postgres/tutorial.model'); // Para reportes de tutorías
const StudentModel = require('../models/postgres/student.model'); // Para reportes de estudiantes
const ProfessorModel = require('../models/postgres/professor.model'); // Para reportes de profesores
const User = require('../models/postgres/user.model'); // Para incluir datos de usuario
const Subject = require('../models/postgres/subject.model'); // Para incluir datos de asignatura
const ReportType = require('../enums/report-type.enum');
const ReportFormat = require('../enums/report-format.enum');

const reportService = {
    /**
     * Genera un reporte específico basado en el tipo y los filtros.
     * @param {string} reportType - Tipo de reporte (del enum ReportType).
     * @param {object} filters - Filtros para el reporte (ej. startDate, endDate, studentId, teacherId).
     * @returns {Promise<Array>} Datos crudos del reporte.
     */
    async generateReportData(reportType, filters) {
        switch (reportType) {
            case ReportType.SYSTEM_AUDIT:
                return logService.getAuditLogsForReport(filters.startDate, filters.endDate);

            case ReportType.TUTORINGS_COMPLETED:
                // Reporte de tutorías completadas en un rango de fechas
                const completedTutorings = await Tutoring.findAll({
                    where: {
                        status: 'COMPLETED',
                        startDate: {
                            [require('sequelize').Op.gte]: new Date(filters.startDate),
                            [require('sequelize').Op.lte]: new Date(`${filters.endDate}T23:59:59.999`)
                        }
                    },
                    include: [
                        { model: StudentModel, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                        { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                        { model: Subject, as: 'subject', attributes: ['name', 'code'] }
                    ],
                    order: [['startDate', 'ASC']]
                });
                return completedTutorings.map(t => ({
                    id: t.id,
                    studentName: t.student.user.name,
                    studentEmail: t.student.user.email,
                    teacherName: t.teacher.user.name,
                    teacherEmail: t.teacher.user.email,
                    subjectName: t.subject.name,
                    subjectCode: t.subject.code,
                    startDate: t.startDate.toISOString().split('T')[0],
                    startTime: t.startDate.toTimeString().substring(0, 5),
                    endTime: t.endDate.toTimeString().substring(0, 5),
                    durationMinutes: (t.endDate.getTime() - t.startDate.getTime()) / (1000 * 60),
                    status: t.status,
                    observations: t.observations
                }));

            // TODO: Añadir lógica para otros tipos de reportes (STUDENT_ATTENDANCE, TEACHER_PERFORMANCE, etc.)
            // Estos requerirán consultas más complejas y posiblemente agregaciones
            case ReportType.STUDENT_ATTENDANCE:
                // Ejemplo simple: Listar estudiantes y el número de tutorías que han tenido
                const studentsWithTutoringCount = await StudentModel.findAll({
                    include: [
                        { 
                            model: User, 
                            as: 'user', 
                            attributes: ['name', 'email'],
                            required: true 
                        },
                        { 
                            model: Tutoring, 
                            as: 'tutorings', 
                            where: { status: 'COMPLETED' },
                            attributes: [], // No queremos los detalles de las tutorías, solo contarlas
                            required: false // LEFT JOIN si queremos estudiantes sin tutorías completadas
                        }
                    ],
                    attributes: [
                        'id',
                        [sequelize.col('user.name'), 'studentName'],
                        [sequelize.col('user.email'), 'studentEmail'],
                        [sequelize.fn('COUNT', sequelize.col('tutorings.id')), 'completedTutoringsCount']
                    ],
                    group: ['Student.id', 'user.id', 'user.name', 'user.email'], // Agrupar por estudiante y sus datos de usuario
                    order: [[sequelize.col('completedTutoringsCount'), 'DESC']]
                });
                return studentsWithTutoringCount;

            case ReportType.TEACHER_PERFORMANCE:
                // Ejemplo simple: Listar profesores y el número de tutorías que han impartido
                 const teachersWithTutoringCount = await ProfessorModel.findAll({
                    include: [
                        { 
                            model: User, 
                            as: 'user', 
                            attributes: ['name', 'email'],
                            required: true 
                        },
                        { 
                            model: Tutoring, 
                            as: 'givenTutorings', 
                            where: { status: 'COMPLETED' },
                            attributes: [], 
                            required: false 
                        }
                    ],
                    attributes: [
                        'id',
                        [sequelize.col('user.name'), 'teacherName'],
                        [sequelize.col('user.email'), 'teacherEmail'],
                        [sequelize.fn('COUNT', sequelize.col('givenTutorings.id')), 'completedTutoringsCount']
                    ],
                    group: ['Professor.id', 'user.id', 'user.name', 'user.email'],
                    order: [[sequelize.col('completedTutoringsCount'), 'DESC']]
                });
                return teachersWithTutoringCount;

            default:
                throw new Error('Tipo de reporte no soportado.');
        }
    },

    /**
     * Exporta los datos de un reporte a un formato específico.
     * @param {Array} data - Los datos crudos del reporte.
     * @param {string} format - Formato de exportación (del enum ReportFormat).
     * @param {string} reportName - Nombre del reporte para el archivo.
     * @returns {Promise<Buffer>} Buffer del archivo generado.
     */
    async exportReport(data, format, reportName = 'reporte') {
        switch (format) {
            case ReportFormat.JSON:
                return Buffer.from(JSON.stringify(data, null, 2), 'utf8');

            case ReportFormat.CSV:
                if (!data || data.length === 0) return Buffer.from('');
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(row => Object.values(row).map(value => {
                    // Escapar comas y comillas dobles para CSV
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(','));
                return Buffer.from([headers, ...rows].join('\n'), 'utf8');

            case ReportFormat.EXCEL:
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(reportName);

                if (data && data.length > 0) {
                    // Headers
                    const columns = Object.keys(data[0]).map(key => ({ header: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), key: key })); // Formatear nombres de columnas
                    worksheet.columns = columns;

                    // Rows
                    worksheet.addRows(data);
                } else {
                    worksheet.addRow(['No hay datos para este reporte.']);
                }

                return workbook.xlsx.writeBuffer();

            case ReportFormat.PDF:
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                let buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => { });

                doc.fontSize(16).text(`Reporte: ${reportName}`, { align: 'center' }).moveDown();
                doc.fontSize(10);

                if (data && data.length > 0) {
                    const keys = Object.keys(data[0]);
                    const columnWidth = doc.page.width / (keys.length + 1) - 30; // Ajustar ancho
                    let y = doc.y;

                    // Headers
                    keys.forEach((key, i) => {
                        doc.text(key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), 30 + i * columnWidth, y, { width: columnWidth, align: 'left' });
                    });
                    doc.moveDown();
                    y = doc.y; // Update y after header

                    // Data Rows
                    data.forEach(row => {
                        keys.forEach((key, i) => {
                            let value = row[key];
                            if (typeof value === 'object' && value !== null) {
                                value = JSON.stringify(value); // Convertir objetos anidados a string
                            }
                            doc.text(String(value), 30 + i * columnWidth, y, { width: columnWidth, align: 'left' });
                        });
                        doc.moveDown();
                        y = doc.y; // Update y after row
                        if (y > (doc.page.height - 50)) { // Check for page break
                            doc.addPage();
                            y = doc.y; // Reset y for new page
                        }
                    });
                } else {
                    doc.text('No hay datos para este reporte.');
                }

                doc.end();

                return new Promise((resolve) => {
                    doc.on('end', () => {
                        const buffer = Buffer.concat(buffers);
                        resolve(buffer);
                    });
                });

            default:
                throw new Error('Formato de exportación no soportado.');
        }
    }
};

module.exports = reportService;