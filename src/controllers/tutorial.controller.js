// src/controllers/tutorial.controller.js
const tutorialService = require('../services/tutorial.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ActionType = require('../enums/action-type.enum');
const RequestStatus = require('../enums/request-status.enum');
const TutoringStatus = require('../enums/tutoring-status.enum'); 

const tutorialController = {
    // --- Métodos para Solicitudes de Tutoría (TutoringRequest) ---
    async createTutoringRequest(req, res) {
        try {
            const { newRequest, warning } = await tutorialService.createTutoringRequest(req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.REQUEST_TUTORING, { requestId: newRequest.id, studentId: newRequest.studentId, teacherId: newRequest.teacherId }, req);

            if (warning) {
                // Si hay una advertencia (ej. conflicto de horario de clase), enviar 200 OK con la advertencia
                sendSuccess(res, { request: newRequest, warning: warning }, 'Solicitud de tutoría creada con advertencia', 200);
            } else {
                sendSuccess(res, newRequest, 'Solicitud de tutoría creada exitosamente', 201);
            }
        } catch (error) {
            console.error('Error en tutorialController.createTutoringRequest:', error.message);
            // Códigos de estado HTTP más específicos para errores conocidos
            if (error.message.includes('no encontrados') || error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404); // Not Found
            }
            if (error.message.includes('superpone') || error.message.includes('disponibilidad') || error.message.includes('duración')) {
                return sendError(res, error.message, 409); // Conflict
            }
            sendError(res, error.message, 400); // Bad Request para validaciones o 500 para otros
        }
    },

    async getTutoringRequests(req, res) {
        try {
            const { studentId, teacherId, status } = req.query; // Filtrar por query params
            const requests = await tutorialService.getTutoringRequests({ studentId, teacherId, status });
            sendSuccess(res, requests, 'Solicitudes de tutoría obtenidas exitosamente');
        } catch (error) {
            console.error('Error en tutorialController.getTutoringRequests:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async getTutoringRequestById(req, res) {
        try {
            const { id } = req.params;
            const request = await tutorialService.getTutoringRequestById(id);
            sendSuccess(res, request, 'Solicitud de tutoría obtenida exitosamente');
        } catch (error) {
            console.error('Error en tutorialController.getTutoringRequestById:', error.message);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    // Aprobación/Rechazo de solicitudes (solo para docentes)
    async processTutoringRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { status, rejectionReason } = req.body; // status: APPROVED, REJECTED, CANCELLED

            // Verificar que el usuario autenticado sea el docente de la solicitud o un admin
            const request = await tutorialService.getTutoringRequestById(requestId);
            if (!request) {
                return sendError(res, 'Solicitud no encontrada.', 404);
            }
            // Asumiendo que req.user.professor es el perfil del profesor autenticado
            // En una etapa posterior, se implementaría un middleware de autorización más robusto.
            const authenticatedUserRole = req.user && req.user.role ? req.user.role.name : null;
            const authenticatedUserId = req.user ? req.user.id : null;

            // Asegurarse de que request.teacher y request.teacher.userId existen
            const requestTeacherUserId = request.teacher && request.teacher.userId ? request.teacher.userId : null;

            if (authenticatedUserRole === 'teacher') {
                if (requestTeacherUserId !== authenticatedUserId) {
                    return sendError(res, 'No tienes permiso para procesar esta solicitud. No eres el docente asignado.', 403);
                }
            } else if (authenticatedUserRole !== 'admin') { // Solo el docente asignado o un admin pueden procesar
                return sendError(res, 'No tienes permiso para procesar esta solicitud. Solo docentes o administradores.', 403);
            }
            // Si el rol es admin, puede procesar cualquier solicitud

            const result = await tutorialService.processTutoringRequest(requestId, status, rejectionReason);
            
            let actionType = '';
            if (status === RequestStatus.APPROVED) actionType = ActionType.APPROVE_TUTORING_REQUEST;
            else if (status === RequestStatus.REJECTED) actionType = ActionType.REJECT_TUTORING_REQUEST;
            else if (status === RequestStatus.CANCELLED) actionType = ActionType.CANCEL_TUTORING; // Cancelación de solicitud
            
            await logService.registerAction(req.user.id, req.user.email, actionType, { requestId: requestId, newStatus: status, teacherId: req.user.id }, req);

            sendSuccess(res, result, `Solicitud de tutoría ${status.toLowerCase()} exitosamente`);
        } catch (error) {
            console.error('Error en tutorialController.processTutoringRequest:', error.message);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            if (error.message.includes('ya ha sido procesada') || error.message.includes('disponibilidad') || error.message.includes('razón')) {
                return sendError(res, error.message, 409); // Conflict / Bad Request
            }
            sendError(res, error.message, 400); // Bad Request
        }
    },

    // --- Métodos para Tutorías Agendadas (Tutoring) ---
    async cancelTutoring(req, res) {
        try {
            const { tutoringId } = req.params;
            const { reason } = req.body; // Razón de cancelación (opcional)
            // Aquí req.user.id es el userId de la persona que cancela
            const result = await tutorialService.cancelTutoring(tutoringId, req.user.id, reason);
            await logService.registerAction(req.user.id, req.user.email, ActionType.CANCEL_TUTORING, { tutoringId: tutoringId, userId: req.user.id }, req);
            sendSuccess(res, result, 'Tutoría cancelada exitosamente');
        } catch (error) {
            console.error('Error en tutorialController.cancelTutoring:', error.message);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 400); // Bad Request o 403 Forbidden si es por permisos
        }
    },

    async markTutoringSession(req, res) {
        try {
            const { tutoringId } = req.params;
            const { status, observations } = req.body; // status: COMPLETED o NO_SHOW

            // TODO: Autenticación/Autorización: Solo el docente de la tutoría o un admin pueden marcarla
            // const tutoring = await tutorialService.getTutoringById(tutoringId); // Para verificar que el usuario autenticado sea el docente
            // if (tutoring.teacherId !== req.user.professor.id && req.user.role.name !== 'admin') {
            //     return sendError(res, 'No tienes permiso para marcar el estado de esta tutoría.', 403);
            // }

            const result = await tutorialService.markTutoringSession(tutoringId, status, observations);
            await logService.registerAction(req.user.id, req.user.email, ActionType.MARK_ATTENDANCE, { tutoringId: tutoringId, newStatus: status, markedBy: req.user.id }, req);
            sendSuccess(res, result, `Tutoría marcada como ${status} exitosamente.`);
        } catch (error) {
            console.error('Error en tutorialController.markTutoringSession:', error.message);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 400); // Bad Request para errores de estado inválido
        }
    },

    async getTutorings(req, res) {
        try {
            const { studentId, teacherId, status } = req.query;
            const tutorings = await tutorialService.getTutorings({ studentId, teacherId, status });
            sendSuccess(res, tutorings, 'Tutorías obtenidas exitosamente');
        } catch (error) {
            console.error('Error en tutorialController.getTutorings:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async getTutoringById(req, res) {
        try {
            const { id } = req.params;
            const tutoring = await Tutoring.findByPk(id, { // Reutilizar el modelo directamente o crear un método en el servicio
                include: [
                    { model: StudentModel, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                    { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                    { model: SubjectModel, as: 'subject', attributes: ['name', 'code'] }
                ]
            });
            if (!tutoring) {
                return sendError(res, 'Tutoría no encontrada.', 404);
            }
            sendSuccess(res, tutoring, 'Tutoría obtenida exitosamente');
        } catch (error) {
            console.error('Error en tutorialController.getTutoringById:', error.message);
            sendError(res, error.message, 500);
        }
    },

    // En futuras solicitudes: markAttendance, addObservations, updateTutoring etc.
};

module.exports = tutorialController;