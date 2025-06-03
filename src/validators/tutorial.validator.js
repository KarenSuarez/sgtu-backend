// src/validators/tutorial.validator.js
const Joi = require('joi');

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // HH:MM:SS

const createTutoringRequestSchema = Joi.object({
    studentId: Joi.number().integer().required().messages({
        'any.required': 'El ID del estudiante es obligatorio.',
        'number.base': 'El ID del estudiante debe ser un número.',
        'number.integer': 'El ID del estudiante debe ser un entero.'
    }),
    teacherId: Joi.number().integer().required().messages({
        'any.required': 'El ID del docente es obligatorio.',
        'number.base': 'El ID del docente debe ser un número.',
        'number.integer': 'El ID del docente debe ser un entero.'
    }),
    subjectId: Joi.number().integer().required().messages({
        'any.required': 'El ID de la asignatura es obligatorio.',
        'number.base': 'El ID de la asignatura debe ser un número.',
        'number.integer': 'El ID de la asignatura debe ser un entero.'
    }),
    desiredDate: Joi.string().pattern(dateOnlyRegex).required().messages({
        'any.required': 'La fecha deseada para la tutoría es obligatoria.',
        'string.pattern.base': 'La fecha deseada debe estar en formato YYYY-MM-DD.'
    }),
    startTime: Joi.string().pattern(timeRegex).required().messages({
        'any.required': 'La hora de inicio deseada es obligatoria.',
        'string.pattern.base': 'La hora de inicio debe estar en formato HH:MM:SS.'
    }),
    endTime: Joi.string().pattern(timeRegex).required().messages({
        'any.required': 'La hora de fin deseada es obligatoria.',
        'string.pattern.base': 'La hora de fin debe estar en formato HH:MM:SS.'
    }),
    message: Joi.string().max(1000).allow(null, '').messages({
        'string.max': 'El mensaje no puede exceder los {#limit} caracteres.'
    })
}).custom((value, helpers) => {
    // Validar que la hora de fin sea posterior a la de inicio
    const start = value.startTime;
    const end = value.endTime;
    if (start && end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);

        const startDateObj = new Date(0, 0, 0, sh, sm);
        const endDateObj = new Date(0, 0, 0, eh, em);

        if (startDateObj >= endDateObj) {
            return helpers.error('any.custom', { message: 'La hora de fin debe ser posterior a la hora de inicio.' });
        }

        // Validar duración máxima de 2 horas (120 minutos)
        const durationMinutes = (endDateObj - startDateObj) / (1000 * 60);
        if (durationMinutes > 120) {
            return helpers.error('any.custom', { message: 'La duración de la tutoría no puede exceder las 2 horas (120 minutos).' });
        }
    }
    return value;
}, 'tutoringRequestDurationValidation');


const updateTutoringRequestStatusSchema = Joi.object({
    status: Joi.string().valid('APPROVED', 'REJECTED', 'CANCELLED').required().messages({
        'any.required': 'El estado es obligatorio.',
        'any.only': 'El estado solo puede ser APPROVED, REJECTED o CANCELLED.'
    }),
    rejectionReason: Joi.string().max(500).allow(null, '').when('status', {
        is: 'REJECTED',
        then: Joi.string().min(5).required().messages({ // Razón obligatoria si es rechazada
            'any.required': 'La razón de rechazo es obligatoria si el estado es REJECTED.',
            'string.min': 'La razón de rechazo debe tener al menos {#limit} caracteres.'
        }),
        otherwise: Joi.forbidden()
    })
});

module.exports = {
    createTutoringRequestSchema,
    updateTutoringRequestStatusSchema
};