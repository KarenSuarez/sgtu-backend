// src/validators/subject.validator.js
const Joi = require('joi');

const createSubjectSchema = Joi.object({
    code: Joi.string().min(3).max(100).required().messages({
        'string.min': 'El código de la asignatura debe tener al menos {#limit} caracteres.',
        'string.max': 'El código de la asignatura no puede exceder los {#limit} caracteres.',
        'string.empty': 'El código de la asignatura no puede estar vacío.',
        'any.required': 'El código de la asignatura es obligatorio.'
    }),
    name: Joi.string().min(3).max(255).required().messages({
        'string.min': 'El nombre de la asignatura debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre de la asignatura no puede exceder los {#limit} caracteres.',
        'string.empty': 'El nombre de la asignatura no puede estar vacío.',
        'any.required': 'El nombre de la asignatura es obligatorio.'
    }),
    credits: Joi.number().integer().min(1).required().messages({
        'number.base': 'Los créditos deben ser un número.',
        'number.integer': 'Los créditos deben ser un número entero.',
        'number.min': 'Los créditos deben ser al menos {#limit}.',
        'any.required': 'Los créditos son obligatorios.'
    }),
    area: Joi.string().max(255).allow(null, '').messages({ // Puede ser opcional
        'string.max': 'El área no puede exceder los {#limit} caracteres.'
    }),
    status: Joi.boolean().default(true)
});

const updateSubjectSchema = Joi.object({
    code: Joi.string().min(3).max(100),
    name: Joi.string().min(3).max(255),
    credits: Joi.number().integer().min(1),
    area: Joi.string().max(255).allow(null, ''),
    status: Joi.boolean()
}).min(1).messages({ // Al menos un campo debe ser proporcionado para la actualización
    'object.min': 'Debe proporcionar al menos un campo para actualizar la asignatura.'
});

// Esquema para asociar/desasociar usuarios con asignaturas (para UserSubjects)
const userSubjectSchema = Joi.object({
    userId: Joi.number().integer().required().messages({
        'number.base': 'El ID de usuario debe ser un número.',
        'number.integer': 'El ID de usuario debe ser un número entero.',
        'any.required': 'El ID de usuario es obligatorio.'
    }),
    subjectId: Joi.number().integer().required().messages({
        'number.base': 'El ID de asignatura debe ser un número.',
        'number.integer': 'El ID de asignatura debe ser un número entero.',
        'any.required': 'El ID de asignatura es obligatorio.'
    })
});

module.exports = {
    createSubjectSchema,
    updateSubjectSchema,
    userSubjectSchema
};