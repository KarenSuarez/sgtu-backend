// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { sendError } = require('../utils/response');
const UserModel = require('../models/postgres/user.model');
const RoleModel = require('../models/postgres/role.model'); // <-- Importar RoleModel

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return sendError(res, 'Token de autenticación no proporcionado', 401);
    }

    try {
        const decoded = jwt.verify(token, secret);
        
        // Buscar el usuario y asegurar que su ROL esté incluido
        const user = await UserModel.findByPk(decoded.id, {
            include: { model: RoleModel, as: 'role' } // <-- Asegurar que el rol se carga aquí
        });

        if (!user || user.status !== 'ACTIVE') {
            return sendError(res, 'Token inválido o usuario inactivo', 403);
        }

        // Si el rol no se cargó por alguna razón (aunque poco probable con include), proteger
        if (!user.role || !user.role.name) {
             console.warn(`Usuario ${user.id} no tiene rol o rol.name definido.`);
             return sendError(res, 'Token inválido: Rol de usuario no encontrado.', 403);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Token de autenticación ha expirado', 401);
        }
        return sendError(res, 'Token de autenticación inválido', 403);
    }
};

module.exports = authenticateToken;