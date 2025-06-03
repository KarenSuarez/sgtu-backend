// src/routes/tutorial.routes.js
const express = require('express');
const tutorialController = require('../controllers/tutorial.controller');
const validate = require('../middleware/validation.middleware');
const authenticateToken = require('../middleware/auth.middleware');
// const authorizeRoles = require('../middleware/role.middleware');

const {
    createTutoringRequestSchema,
    updateTutoringRequestStatusSchema
} = require('../validators/tutorial.validator');
const Joi = require('joi'); // Para el validador inline del status de sesion

const router = express.Router();

// --- Rutas para Solicitudes de Tutoría (TutoringRequest) ---
router.post('/requests', authenticateToken, validate(createTutoringRequestSchema), tutorialController.createTutoringRequest);
router.get('/requests', authenticateToken, tutorialController.getTutoringRequests);
router.get('/requests/:id', authenticateToken, tutorialController.getTutoringRequestById);
router.patch('/requests/:requestId/process', authenticateToken, validate(updateTutoringRequestStatusSchema), tutorialController.processTutoringRequest);


// --- Rutas para Tutorías Agendadas (Tutoring) ---
router.patch('/:tutoringId/cancel', authenticateToken, tutorialController.cancelTutoring);

// NUEVA RUTA: Marcar el estado de una sesión de tutoría (COMPLETED, NO_SHOW)
router.patch('/:tutoringId/mark', authenticateToken, validate(Joi.object({
    status: Joi.string().valid('COMPLETED', 'NO_SHOW').required().messages({
        'any.only': 'El estado de la sesión debe ser COMPLETED o NO_SHOW.',
        'any.required': 'El estado de la sesión es obligatorio.'
    }),
    observations: Joi.string().max(1000).allow(null, '')
})), tutorialController.markTutoringSession);


router.get('/', authenticateToken, tutorialController.getTutorings);
router.get('/:id', authenticateToken, tutorialController.getTutoringById);


module.exports = router;