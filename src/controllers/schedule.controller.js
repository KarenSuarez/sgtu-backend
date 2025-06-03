// src/controllers/schedule.controller.js
const scheduleService = require('../services/schedule.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ActionType = require('../enums/action-type.enum');

const scheduleController = {
    // --- Métodos existentes para ClassSchedule (sin cambios funcionales) ---
    async createClassSchedule(req, res) {
        try {
            const newSchedule = await scheduleService.createClassSchedule(req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.CREATE_CLASS_SCHEDULE, { scheduleId: newSchedule.id, userId: newSchedule.userId }, req);
            sendSuccess(res, newSchedule, 'Horario de clase creado exitosamente', 201);
        } catch (error) {
            console.error('Error en scheduleController.createClassSchedule:', error);
            sendError(res, error.message, 500);
        }
    },

    async getAllClassSchedules(req, res) {
        try {
            const schedules = await scheduleService.getAllClassSchedules();
            sendSuccess(res, schedules, 'Horarios de clase obtenidos exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getAllClassSchedules:', error);
            sendError(res, error.message, 500);
        }
    },

    async getClassScheduleById(req, res) {
        try {
            const { id } = req.params;
            const schedule = await scheduleService.getClassScheduleById(id);
            sendSuccess(res, schedule, 'Horario de clase obtenido exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getClassScheduleById:', error);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async updateClassSchedule(req, res) {
        try {
            const { id } = req.params;
            const updatedSchedule = await scheduleService.updateClassSchedule(id, req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.UPDATE_CLASS_SCHEDULE, { scheduleId: updatedSchedule.id, changes: req.body }, req);
            sendSuccess(res, updatedSchedule, 'Horario de clase actualizado exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.updateClassSchedule:', error);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async deleteClassSchedule(req, res) {
        try {
            const { id } = req.params;
            const result = await scheduleService.deleteClassSchedule(id);
            await logService.registerAction(req.user.id, req.user.email, ActionType.DELETE_CLASS_SCHEDULE, { scheduleId: id }, req);
            sendSuccess(res, result, 'Horario de clase eliminado exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.deleteClassSchedule:', error);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async getClassSchedulesForUser(req, res) {
        try {
            const { userId } = req.params;
            const schedules = await scheduleService.getClassSchedulesByUser(userId);
            sendSuccess(res, schedules, 'Horarios de clase del usuario obtenidos exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getClassSchedulesForUser:', error);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    // --- NUEVOS MÉTODOS PARA AVAILABLESCHEDULE ---

    async createAvailabilitySchedule(req, res) {
        try {
            const newAvailability = await scheduleService.createAvailabilitySchedule(req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.CREATE_AVAILABILITY_SCHEDULE, { availabilityId: newAvailability.id, teacherId: newAvailability.teacherId }, req);
            sendSuccess(res, newAvailability, 'Horario de disponibilidad creado exitosamente', 201);
        } catch (error) {
            console.error('Error en scheduleController.createAvailabilitySchedule:', error.message);
            // Si el error viene de la validación del modelo, el mensaje ya es descriptivo
            sendError(res, error.message, 400); // 400 Bad Request por validación
        }
    },

    async getAllAvailabilitySchedules(req, res) {
        try {
            const schedules = await scheduleService.getAllAvailabilitySchedules();
            sendSuccess(res, schedules, 'Horarios de disponibilidad obtenidos exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getAllAvailabilitySchedules:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async getAvailabilityScheduleById(req, res) {
        try {
            const { id } = req.params;
            const schedule = await scheduleService.getAvailabilityScheduleById(id);
            sendSuccess(res, schedule, 'Horario de disponibilidad obtenido exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getAvailabilityScheduleById:', error.message);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async updateAvailabilitySchedule(req, res) {
        try {
            const { id } = req.params;
            const updatedAvailability = await scheduleService.updateAvailabilitySchedule(id, req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.UPDATE_AVAILABILITY_SCHEDULE, { availabilityId: updatedAvailability.id, changes: req.body }, req);
            sendSuccess(res, updatedAvailability, 'Horario de disponibilidad actualizado exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.updateAvailabilitySchedule:', error.message);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 400); // Bad Request para errores de validación
        }
    },

    async deleteAvailabilitySchedule(req, res) {
        try {
            const { id } = req.params;
            const result = await scheduleService.deleteAvailabilitySchedule(id);
            await logService.registerAction(req.user.id, req.user.email, ActionType.DELETE_AVAILABILITY_SCHEDULE, { availabilityId: id }, req);
            sendSuccess(res, result, 'Horario de disponibilidad eliminado exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.deleteAvailabilitySchedule:', error.message);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    },

    async getAvailabilitySchedulesForTeacher(req, res) {
        try {
            const { teacherId } = req.params;
            const schedules = await scheduleService.getAvailabilitySchedulesByTeacher(teacherId);
            sendSuccess(res, schedules, 'Horarios de disponibilidad del profesor obtenidos exitosamente');
        } catch (error) {
            console.error('Error en scheduleController.getAvailabilitySchedulesForTeacher:', error.message);
            if (error.message.includes('no encontrado')) {
                return sendError(res, error.message, 404);
            }
            sendError(res, error.message, 500);
        }
    }
};

module.exports = scheduleController;