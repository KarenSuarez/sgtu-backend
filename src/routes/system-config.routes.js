// src/routes/system-config.routes.js
const express = require('express');
const systemConfigController = require('../controllers/system-config.controller');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware'); // Para uso futuro
const validate = require('../middleware/validation.middleware');
const Joi = require('joi'); // Para el validador de configuración

// Esquema de validación para setConfiguration
const setConfigSchema = Joi.object({
    value: Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.boolean(),
        Joi.object(),
        Joi.array()
    ).required(),
    description: Joi.string().allow(null, '').optional()
});

const router = express.Router();

// Obtener una configuración específica
router.get('/:key', authenticateToken, systemConfigController.getConfiguration);

// Actualizar o crear una configuración (solo admins)
router.put('/:key', authenticateToken, validate(setConfigSchema), systemConfigController.setConfiguration);

// Obtener todas las configuraciones (solo admins)
router.get('/', authenticateToken, systemConfigController.getAllConfigurations);


module.exports = router;