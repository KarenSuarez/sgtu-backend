// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const logService = require('../services/log.service');
const { sendSuccess, sendError } = require('../utils/response');
const ActionType = require('../enums/action-type.enum');

const authController = {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const { user, token } = await authService.login(email, password);
            await logService.registerAction(user.id, user.email, ActionType.LOGIN, {}, req); // Registrar login
            sendSuccess(res, { user, token }, 'Inicio de sesión exitoso');
        } catch (error) {
            await logService.registerAction(null, email, ActionType.LOGIN, { status: 'Failed', error: error.message }, req); // Registrar intento fallido
            sendError(res, error.message, 401); // 401 Unauthorized
        }
    },

    async logout(req, res) {
        // Para logout con JWT, el cliente simplemente debe descartar el token.
        // Aquí puedes añadir lógica de invalidación de tokens si usas listas negras o sesiones en BD.
        // Por ahora, solo registramos el evento.
        const user = req.user; // Obtenido del middleware de autenticación
        if (user) {
            await logService.registerAction(user.id, user.email, ActionType.LOGOUT, {}, req);
        }
        sendSuccess(res, null, 'Sesión cerrada exitosamente');
    },

    async getCurrentUser(req, res) {
        // req.user viene del middleware de autenticación
        try {
            const user = req.user;
            // Retornar el perfil completo del usuario
            const userProfile = await require('../services/user.service').getUserProfile(user.id);
            sendSuccess(res, userProfile, 'Datos del usuario actual obtenidos');
        } catch (error) {
            sendError(res, error.message, 404);
        }
    }
};

module.exports = authController;