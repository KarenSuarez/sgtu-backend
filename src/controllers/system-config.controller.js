// src/controllers/system-config.controller.js
const SystemConfigurationService = require('../services/system-configuration.service');
const { sendSuccess, sendError } = require('../utils/response');

const systemConfigServiceInstance = SystemConfigurationService.getInstance();

const systemConfigController = {
    async getConfiguration(req, res) {
        try {
            const { key } = req.params;
            const configValue = systemConfigServiceInstance.getConfiguration(key);
            if (configValue === undefined) {
                return sendError(res, 'Configuración no encontrada.', 404);
            }
            sendSuccess(res, { key, value: configValue }, 'Configuración obtenida exitosamente');
        } catch (error) {
            console.error('Error en systemConfigController.getConfiguration:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async setConfiguration(req, res) {
        try {
            const { key } = req.params;
            const { value, description } = req.body;
            // TODO: Añadir autorización: solo admins pueden cambiar la configuración
            const updatedConfig = await systemConfigServiceInstance.setConfiguration(key, value, description);
            sendSuccess(res, updatedConfig, 'Configuración actualizada exitosamente');
        } catch (error) {
            console.error('Error en systemConfigController.setConfiguration:', error.message);
            sendError(res, error.message, 500);
        }
    },

    async getAllConfigurations(req, res) {
        try {
            // TODO: Añadir autorización: solo admins pueden ver todas las configuraciones
            const allConfigs = await systemConfigServiceInstance.loadConfigurations(); // Recargar y obtener todas
            sendSuccess(res, systemConfigServiceInstance.configurations, 'Todas las configuraciones obtenidas exitosamente');
        } catch (error) {
            console.error('Error en systemConfigController.getAllConfigurations:', error.message);
            sendError(res, error.message, 500);
        }
    }
};

module.exports = systemConfigController;