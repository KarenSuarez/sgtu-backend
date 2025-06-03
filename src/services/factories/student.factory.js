// src/services/factories/student.factory.js
// No se necesita importar el modelo User aquí, el servicio UserService manejará la creación del usuario base
const User = require('../../models/postgres/user.model');
const Student = require('../../models/postgres/student.model');
const Role = require('../../models/postgres/role.model');
const UserType = require('../../enums/user-type.enum');

class StudentFactory {
    async createUser(userData, transaction) {
        // Asume que el usuario base ya fue creado o se creará en el servicio UserService
        // Este factory solo se encarga de crear el perfil de estudiante
        const { id: userId } = userData; // Espera que userData contenga el ID del usuario base
        const studentData = {
            userId: userId,
            code: userData.code,
            program: userData.program,
            semester: userData.semester
        };
        const newStudent = await Student.create(studentData, { transaction });
        return { user: userData, student: newStudent };
    }

    validateData(data) {
        // La validación más profunda se hace en el Joi validator
        if (!data.code || !data.program || !data.semester) {
            throw new Error('Datos de estudiante incompletos.');
        }
        return true;
    }
}

module.exports = StudentFactory;