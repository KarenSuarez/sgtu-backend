// src/services/factories/user.factory.js
const StudentFactory = require('./student.factory');
const ProfessorFactory = require('./professor.factory'); // Renombrado a ProfessorFactory para consistencia
const UserType = require('../../enums/user-type.enum');

const userFactoryProvider = {
    getFactory(userType) {
        switch (userType) {
            case UserType.STUDENT:
                return new StudentFactory();
            case UserType.TEACHER:
                return new ProfessorFactory();
            default:
                throw new Error('Tipo de usuario no soportado para creación.');
        }
    }
};

module.exports = userFactoryProvider;