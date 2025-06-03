// src/utils/response.js
class ApiResponse {
    constructor(statusCode, message = "Success", data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
    res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};

const sendError = (res, message = 'Error interno del servidor', statusCode = 500, errors = null) => {
    res.status(statusCode).json({
        statusCode,
        message,
        success: false,
        errors
    });
};

module.exports = {
    ApiResponse,
    sendSuccess,
    sendError
};