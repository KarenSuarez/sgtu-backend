// src/controllers/subject.controller.js
const subjectService = require('../services/subject.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ActionType = require('../enums/action-type.enum');

const subjectController = {
    async createSubject(req, res) {
        try {
            const newSubject = await subjectService.createSubject(req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.CREATE_SUBJECT || 'CREATE_SUBJECT', { subjectId: newSubject.id, subjectName: newSubject.name }, req);
            sendSuccess(res, newSubject, 'Asignatura creada exitosamente', 201);
        } catch (error) {
            console.error('Error en subjectController.createSubject:', error);
            if (error.message.includes('ya existe')) {
                return sendError(res, error.message, 409); // Conflict
            }
            sendError(res, error.message, 500);
        }
    },

    async getAllSubjects(req, res) {
        try {
            const subjects = await subjectService.getAllSubjects();
            sendSuccess(res, subjects, 'Asignaturas obtenidas exitosamente');
        } catch (error) {
            console.error('Error en subjectController.getAllSubjects:', error);
            sendError(res, error.message, 500);
        }
    },

    async getSubjectById(req, res) {
        try {
            const { id } = req.params;
            const subject = await subjectService.getSubjectById(id);
            sendSuccess(res, subject, 'Asignatura obtenida exitosamente');
        } catch (error) {
            console.error('Error en subjectController.getSubjectById:', error);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const updatedSubject = await subjectService.updateSubject(id, req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.UPDATE_SUBJECT || 'UPDATE_SUBJECT', { subjectId: updatedSubject.id, changes: req.body }, req);
            sendSuccess(res, updatedSubject, 'Asignatura actualizada exitosamente');
        } catch (error) {
            console.error('Error en subjectController.updateSubject:', error);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async deleteSubject(req, res) {
        try {
            const { id } = req.params;
            const result = await subjectService.deleteSubject(id);
            await logService.registerAction(req.user.id, req.user.email, ActionType.DELETE_SUBJECT || 'DELETE_SUBJECT', { subjectId: id }, req);
            sendSuccess(res, result, 'Asignatura eliminada exitosamente');
        } catch (error) {
            console.error('Error en subjectController.deleteSubject:', error);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    // Métodos para asociar/desasociar usuarios a asignaturas
    async addUserToSubject(req, res) {
        try {
            const { userId, subjectId } = req.body;
            const result = await subjectService.addUserToSubject(userId, subjectId);
            await logService.registerAction(req.user.id, req.user.email, ActionType.ASSOCIATE_USER_SUBJECT || 'ASSOCIATE_USER_SUBJECT', { userId, subjectId }, req);
            sendSuccess(res, result, 'Usuario asociado a asignatura exitosamente', 201);
        } catch (error) {
            console.error('Error en subjectController.addUserToSubject:', error);
            sendError(res, error.message, 500);
        }
    },

    async removeUserFromSubject(req, res) {
        try {
            const { userId, subjectId } = req.body;
            const result = await subjectService.removeUserFromSubject(userId, subjectId);
            await logService.registerAction(req.user.id, req.user.email, ActionType.DISSOCIATE_USER_SUBJECT || 'DISSOCIATE_USER_SUBJECT', { userId, subjectId }, req);
            sendSuccess(res, result, 'Usuario desasociado de asignatura exitosamente');
        } catch (error) {
            console.error('Error en subjectController.removeUserFromSubject:', error);
            sendError(res, error.message, 500);
        }
    },

    async getSubjectsForUser(req, res) {
        try {
            const { userId } = req.params; // O req.user.id si es para el propio usuario logueado
            const subjects = await subjectService.getSubjectsByUser(userId);
            sendSuccess(res, subjects, 'Asignaturas del usuario obtenidas exitosamente');
        } catch (error) {
            console.error('Error en subjectController.getSubjectsForUser:', error);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

     async getTeachersBySubject(req, res) {
        try {
            const { id } = req.params; // El ID de la asignatura
            const teachers = await subjectService.getTeachersBySubject(id);
            sendSuccess(res, teachers, `Docentes de la asignatura ${id} obtenidos exitosamente`);
        } catch (error) {
            console.error('Error en subjectController.getTeachersBySubject:', error.message);
            if (error.message.includes('no encontrada')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, 'Error al obtener docentes por asignatura.', 500);
        }
    }
};

module.exports = subjectController;