// src/services/user.service.js
const User = require('../models/postgres/user.model');
const Role = require('../models/postgres/role.model');
const StudentModel = require('../models/postgres/student.model');
const ProfessorModel = require('../models/postgres/professor.model'); 
const UserType = require('../enums/user-type.enum');
const UserState = require('../enums/user-state.enum');
const userFactoryProvider = require('./factories/user.factory');
const { hashPassword } = require('../utils/helpers');
const { sequelize } = require('../config/database'); // Importa la instancia de Sequelize

const userService = {
    async createUser(userData) {
        const t = await sequelize.transaction(); // Iniciar una transacción

        try {
            const { name, email, password, userType, ...profileData } = userData;

            // 1. Verificar si el usuario ya existe por email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('El correo electrónico ya está registrado.');
            }

            // 2. Hashear la contraseña
            const hashedPassword = await hashPassword(password);

            // 3. Obtener el ID del rol
            const role = await Role.findOne({ where: { name: userType.toLowerCase() } });
            if (!role) {
                throw new Error(`Rol ${userType} no encontrado.`);
            }

            // 4. Crear el usuario base
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword,
                roleId: role.id,
                status: UserState.ACTIVE // Por defecto, activo al crear
            }, { transaction: t });

            // 5. Usar el Factory para crear el perfil específico (Estudiante/Profesor)
            const userFactory = userFactoryProvider.getFactory(userType);
            
            // Adjuntar el ID del usuario base a los datos del perfil
            const fullProfileData = { ...profileData, id: newUser.id }; 
            await userFactory.createUser(fullProfileData, t);

            await t.commit(); // Confirmar la transacción

            // Omitir la contraseña en la respuesta
            const { password: _, ...userWithoutPassword } = newUser.toJSON();
            return userWithoutPassword;

        } catch (error) {
            await t.rollback(); // Revertir la transacción en caso de error
            console.error('Error en userService.createUser:', error.message);
            throw error; // Re-lanzar el error para que el controlador lo maneje
        }
    },

    async getUserProfile(userId) {
        const user = await User.findByPk(userId, {
            include: [
                { model: Role, as: 'role', attributes: ['name'] },
                { model: require('../models/postgres/student.model'), as: 'student' },
                { model: require('../models/postgres/professor.model'), as: 'professor' }
            ]
        });

        if (!user) {
            throw new Error('Usuario no encontrado.');
        }

        // Omitir la contraseña en la respuesta
        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    },

    // Puedes añadir métodos para actualizar perfil, cambiar estado, etc. aquí
    async updateProfile(userId, updateData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }
        
        // Puedes agregar lógica para actualizar campos específicos o el perfil de estudiante/profesor
        // Por ahora, solo actualizará campos de User si se envían
        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email; // Requiere validación de unicidad
        if (updateData.password) user.password = await hashPassword(updateData.password); // Hashear si se actualiza

        await user.save();
        const { password: _, ...updatedUser } = user.toJSON();
        return updatedUser;
    },

    async changeStatus(userId, newStatus) {
        if (!Object.values(UserState).includes(newStatus)) {
            throw new Error(`Estado inválido: ${newStatus}`);
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }

        user.status = newStatus;
        await user.save();
        const { password: _, ...updatedUser } = user.toJSON();
        return updatedUser;
    },

    /**
     * Obtiene una lista de usuarios, opcionalmente filtrados por rol.
     * Incluye los perfiles de estudiante o profesor si existen.
     * @param {object} filters - Objeto con filtros (ej. { role: 'teacher' }).
     * @returns {Promise<Array>} Lista de objetos de usuario.
     */
    async getAllUsers(filters = {}) {
        const queryOptions = {
            include: [
                { model: Role, as: 'role', attributes: ['name'] }, // Incluir el rol
                { model: StudentModel, as: 'student' }, // Incluir perfil de estudiante
                { model: ProfessorModel, as: 'professor' } // Incluir perfil de profesor
            ]
        };

        if (filters.role) {
            // Asegúrate de que el rol exista en la tabla Roles para la búsqueda
            const targetRole = await Role.findOne({ where: { name: filters.role.toLowerCase() } });
            if (targetRole) {
                queryOptions.where = {
                    roleId: targetRole.id // Filtrar por el ID del rol
                };
            } else {
                // Si el rol no existe, devuelve un array vacío (o lanza un error si lo prefieres)
                return [];
            }
        }

        try {
            const users = await User.findAll(queryOptions);
            // Mapear para eliminar la contraseña antes de devolver
            return users.map(user => {
                const userJson = user.toJSON();
                delete userJson.password;
                return userJson;
            });
        } catch (error) {
            console.error('Error en userService.getAllUsers:', error.message);
            throw error;
        }
    }
};

module.exports = userService;