// src/validators/auth.validator.js
const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'El correo electrónico debe ser una dirección de correo válida.',
        'string.empty': 'El correo electrónico no puede estar vacío.',
        'any.required': 'El correo electrónico es obligatorio.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
        'string.empty': 'La contraseña no puede estar vacía.',
        'any.required': 'La contraseña es obligatoria.'
    })
});

module.exports = {
    loginSchema
};