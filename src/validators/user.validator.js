// src/validators/user.validator.js
const Joi = require('joi');
const UserType = require('../enums/user-type.enum'); // Importa el enum

const createUserSchema = Joi.object({
    name: Joi.string().min(3).max(255).required().messages({
        'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre no puede exceder los {#limit} caracteres.',
        'string.empty': 'El nombre no puede estar vacío.',
        'any.required': 'El nombre es obligatorio.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'El correo electrónico debe ser una dirección de correo válida.',
        'string.empty': 'El correo electrónico no puede estar vacío.',
        'any.required': 'El correo electrónico es obligatorio.'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos {#limit} caracteres.',
        'string.empty': 'La contraseña no puede estar vacío.',
        'any.required': 'La contraseña es obligatoria.'
    }),
    userType: Joi.string().valid(UserType.STUDENT, UserType.TEACHER).required().messages({
        'any.only': 'El tipo de usuario debe ser "STUDENT" o "TEACHER".',
        'string.empty': 'El tipo de usuario no puede estar vacío.',
        'any.required': 'El tipo de usuario es obligatorio.'
    }),
    // Campos específicos para estudiante
    code: Joi.string().when('userType', {
        is: UserType.STUDENT,
        then: Joi.string().min(1).max(100).required(),
        otherwise: Joi.forbidden()
    }),
    program: Joi.string().when('userType', {
        is: UserType.STUDENT,
        then: Joi.string().min(1).max(255).required(),
        otherwise: Joi.forbidden()
    }),
    semester: Joi.number().integer().min(1).when('userType', {
        is: UserType.STUDENT,
        then: Joi.number().required(),
        otherwise: Joi.forbidden()
    }),
    // Campos específicos para profesor
    teacherCode: Joi.string().when('userType', {
        is: UserType.TEACHER,
        then: Joi.string().min(1).max(100).required(),
        otherwise: Joi.forbidden()
    }),
    area: Joi.string().when('userType', {
        is: UserType.TEACHER,
        then: Joi.string().min(1).max(255).required(),
        otherwise: Joi.forbidden()
    })
});

module.exports = {
    createUserSchema
};