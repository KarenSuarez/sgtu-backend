// src/middleware/error.middleware.js
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log del error para depuración
    // Determinar el status code y mensaje del error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Algo salió mal en el servidor.';

    sendError(res, message, statusCode);
};

module.exports = errorHandler;