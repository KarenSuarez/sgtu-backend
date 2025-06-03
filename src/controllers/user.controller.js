// src/controllers/user.controller.js
const userService = require('../services/user.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ActionType = require('../enums/action-type.enum');

const userController = {
    async createUser(req, res) {
        try {
            const userData = req.body;
            const newUser = await userService.createUser(userData);
            // Puedes ajustar el ActionType si la creación de usuario es por un admin vs self-registration
            await logService.registerAction(newUser.id, newUser.email, ActionType.REGISTER_USER || 'CREATE_USER', { createdBy: req.user ? req.user.id : 'system' }, req);
            sendSuccess(res, newUser, 'Usuario creado exitosamente', 201);
        } catch (error) {
            console.error('Error en userController.createUser:', error);
            // Capturar errores específicos del servicio
            if (error.message.includes('El correo electrónico ya está registrado')) {
                return sendError(res, error.message, 409); // 409 Conflict
            }
            if (error.message.includes('Rol no encontrado') || error.message.includes('Tipo de usuario no soportado') || error.message.includes('Datos de estudiante incompletos') || error.message.includes('Datos de profesor incompletos')) {
                return sendError(res, error.message, 400); // 400 Bad Request
            }
            sendError(res, 'Error al crear usuario', 500);
        }
    },

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserProfile(id); // Obtener perfil completo
            sendSuccess(res, user, 'Usuario encontrado');
        } catch (error) {
            sendError(res, error.message, 404);
        }
    },

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await userService.updateProfile(id, req.body);
            await logService.registerAction(req.user.id, req.user.email, ActionType.UPDATE_PROFILE || 'UPDATE_USER', { targetUserId: id, changes: req.body }, req);
            sendSuccess(res, updatedUser, 'Usuario actualizado exitosamente');
        } catch (error) {
            sendError(res, error.message, 400);
        }
    },

    async changeUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // El nuevo estado (ACTIVE, INACTIVE, SUSPENDED)
            const updatedUser = await userService.changeStatus(id, status);
            await logService.registerAction(req.user.id, req.user.email, ActionType.CHANGE_USER_STATUS || 'CHANGE_STATUS', { targetUserId: id, newStatus: status }, req);
            sendSuccess(res, updatedUser, 'Estado del usuario actualizado exitosamente');
        } catch (error) {
            sendError(res, error.message, 400);
        }
    },

    /**
     * Maneja la obtención de una lista de usuarios.
     * Puede filtrar por rol a través de un query parameter 'role'.
     */
    async getAllUsers(req, res) {
        try {
            const { role } = req.query; // Obtiene el parámetro 'role' de la URL (ej. ?role=teacher)
            const filters = role ? { role } : {}; // Crea un objeto de filtros si 'role' está presente

            const users = await userService.getAllUsers(filters);
            sendSuccess(res, users, 'Usuarios obtenidos exitosamente');
        } catch (error) {
            console.error('Error en userController.getAllUsers:', error);
            sendError(res, 'Error al obtener usuarios', 500);
        }
    }

};

module.exports = userController;