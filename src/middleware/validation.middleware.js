// src/middleware/validation.middleware.js
const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {

    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false para obtener todos los errores

    if (error) {
       
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        return sendError(res, 'Errores de validación', 400, errors);
    }
    next();
};

module.exports = validate;