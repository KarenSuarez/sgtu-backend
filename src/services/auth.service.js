// src/services/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/postgres/user.model');
const { secret, expiresIn } = require('../config/jwt');
const { comparePassword } = require('../utils/helpers');
const RoleModel = require('../models/postgres/role.model'); // Asegúrate de importar el modelo Role

const authService = {
    async login(email, password) {
        // 1. Buscar usuario por email, incluyendo el rol
        const user = await UserModel.findOne({
            where: { email },
            include: { model: RoleModel, as: 'role' }
        });

        if (!user) {
            throw new Error('Credenciales inválidas.');
        }

        // 2. Verificar estado del usuario
        if (user.status !== 'ACTIVE') {
            throw new Error('Usuario inactivo o suspendido.');
        }

        // 3. Comparar contraseñas
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new Error('Credenciales inválidas.');
        }

        // 4. Generar JWT
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role ? user.role.name : null // Asegúrate de incluir el nombre del rol
        };
        const token = jwt.sign(payload, secret, { expiresIn });

        // Omitir la contraseña antes de devolver el usuario
        const { password: _, ...userWithoutPassword } = user.toJSON();

        return { user: userWithoutPassword, token };
    },

    // En futuras solicitudes, aquí puedes añadir lógica para refrescar tokens, etc.
};

module.exports = authService;