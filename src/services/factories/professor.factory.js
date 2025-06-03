// src/services/factories/professor.factory.js
// No se necesita importar el modelo User aquí, el servicio UserService manejará la creación del usuario base
const User = require('../../models/postgres/user.model');
const Professor = require('../../models/postgres/professor.model');
const Role = require('../../models/postgres/role.model');
const UserType = require('../../enums/user-type.enum');

class ProfessorFactory {
    async createUser(userData, transaction) {
        // Asume que el usuario base ya fue creado o se creará en el servicio UserService
        // Este factory solo se encarga de crear el perfil de profesor
        const { id: userId } = userData; // Espera que userData contenga el ID del usuario base
        const professorData = {
            userId: userId,
            teacherCode: userData.teacherCode,
            area: userData.area
        };
        const newProfessor = await Professor.create(professorData, { transaction });
        return { user: userData, professor: newProfessor };
    }

    validateData(data) {
        // La validación más profunda se hace en el Joi validator
        if (!data.teacherCode || !data.area) {
            throw new Error('Datos de profesor incompletos.');
        }
        return true;
    }
}

module.exports = ProfessorFactory;