// src/validators/schedule.validator.js
const Joi = require('joi');
const DayOfWeek = require('../enums/day-of-week.enum');

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // HH:MM:SS
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

// Esquemas existentes para ClassSchedule (sin cambios)
const createClassScheduleSchema = Joi.object({
    subjectId: Joi.number().integer().required(),
    userId: Joi.number().integer().required(),
    dayOfWeek: Joi.string().valid(...Object.values(DayOfWeek)).required(),
    startTime: Joi.string().pattern(timeRegex).required(),
    endTime: Joi.string().pattern(timeRegex).required(),
    classroom: Joi.string().max(100).allow(null, '')
});

const updateClassScheduleSchema = Joi.object({
    subjectId: Joi.number().integer(),
    userId: Joi.number().integer(),
    dayOfWeek: Joi.string().valid(...Object.values(DayOfWeek)),
    startTime: Joi.string().pattern(timeRegex),
    endTime: Joi.string().pattern(timeRegex),
    classroom: Joi.string().max(100).allow(null, '')
}).min(1);


// --- ESQUEMAS CORREGIDOS PARA AVAILABLESCHEDULE ---

// Función de validación personalizada para la hora de fin vs. hora de inicio
const validateTimeOrder = (value, helpers) => {
    const start = value.startTime;
    const end = value.endTime;
    if (start && end) {
        const [sh, sm, ss] = start.split(':').map(Number);
        const [eh, em, es] = end.split(':').map(Number);
        // Usar una fecha arbitraria para comparar solo las horas
        const startDate = new Date(0, 0, 0, sh, sm, ss);
        const endDate = new Date(0, 0, 0, eh, em, es);
        if (startDate >= endDate) {
            return helpers.error('any.custom', { message: 'La hora de fin debe ser posterior a la hora de inicio.' });
        }
    }
    return value;
};

const createAvailabilityScheduleSchema = Joi.object({
    teacherId: Joi.number().integer().required().messages({
        'number.base': 'El ID del profesor debe ser un número.',
        'number.integer': 'El ID del profesor debe ser un número entero.',
        'any.required': 'El ID del profesor es obligatorio.'
    }),
    dayOfWeek: Joi.string().valid(...Object.values(DayOfWeek)).messages({
        'any.only': 'El día de la semana no es válido.'
    }),
    specificDate: Joi.string().pattern(dateOnlyRegex).messages({
        'string.pattern.base': 'La fecha específica debe estar en formato YYYY-MM-DD.'
    }),
    startTime: Joi.string().pattern(timeRegex).required().messages({
        'string.pattern.base': 'La hora de inicio debe estar en formato HH:MM:SS.',
        'string.empty': 'La hora de inicio no puede estar vacía.',
        'any.required': 'La hora de inicio es obligatoria.'
    }),
    endTime: Joi.string().pattern(timeRegex).required().messages({
        'string.pattern.base': 'La hora de fin debe estar en formato HH:MM:SS.',
        'string.empty': 'La hora de fin no puede estar vacía.',
        'any.required': 'La hora de fin es obligatoria.'
    }),
    available: Joi.boolean().default(true)
})
// Rule: EXACTLY ONE of 'dayOfWeek' OR 'specificDate' must be present
.xor('dayOfWeek', 'specificDate')
.messages({
    'object.xor': 'Debe proporcionar un día de la semana O una fecha específica, pero no ambos.'
})
// Custom validation for time order
.custom(validateTimeOrder, 'availabilityTimeValidation');


const updateAvailabilityScheduleSchema = Joi.object({
    teacherId: Joi.number().integer(),
    dayOfWeek: Joi.string().valid(...Object.values(DayOfWeek)),
    specificDate: Joi.string().pattern(dateOnlyRegex),
    startTime: Joi.string().pattern(timeRegex),
    endTime: Joi.string().pattern(timeRegex),
    available: Joi.boolean()
}).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar el horario de disponibilidad.'
})
// Rule: NOT BOTH 'dayOfWeek' AND 'specificDate' can be present for an update
.nand('dayOfWeek', 'specificDate')
.messages({
    'object.nand': 'No se puede proporcionar un día de la semana y una fecha específica al mismo tiempo en la actualización.'
})
// Custom validation for time order
.custom(validateTimeOrder, 'updateAvailabilityTimeValidation');


module.exports = {
    createClassScheduleSchema,
    updateClassScheduleSchema,
    createAvailabilityScheduleSchema,
    updateAvailabilityScheduleSchema
};