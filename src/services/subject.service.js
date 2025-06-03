// src/services/subject.service.js
const Subject = require('../models/postgres/subject.model');
const UserSubject = require('../models/postgres/user-subject.model'); // Para asociar usuarios a asignaturas
const User = require('../models/postgres/user.model'); // Necesario para includes
const Professor = require('../models/postgres/professor.model'); // Necesario para includes
const Student = require('../models/postgres/student.model'); // Necesario para includes
const Role = require('../models/postgres/role.model'); 

const subjectService = {
    async createSubject(subjectData) {
        try {
            const newSubject = await Subject.create(subjectData);
            return newSubject;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error(`La asignatura con código '${subjectData.code}' ya existe.`);
            }
            throw new Error(`Error al crear la asignatura: ${error.message}`);
        }
    },

    async getAllSubjects() {
        const subjects = await Subject.findAll({
            // Puedes incluir los usuarios (profesores/estudiantes) asociados si lo deseas
            // include: [
            //     {
            //         model: User,
            //         as: 'users',
            //         through: { attributes: [] }, // No incluir la tabla intermedia UserSubjects
            //         include: [
            //             { model: Professor, as: 'professor', attributes: ['teacherCode', 'area'] },
            //             { model: Student, as: 'student', attributes: ['code', 'program'] }
            //         ],
            //         attributes: ['id', 'name', 'email']
            //     }
            // ]
        });
        return subjects;
    },

    async getSubjectById(id) {
        const subject = await Subject.findByPk(id, {
            // include: [
            //     {
            //         model: User,
            //         as: 'users',
            //         through: { attributes: [] },
            //         include: [
            //             { model: Professor, as: 'professor', attributes: ['teacherCode', 'area'] },
            //             { model: Student, as: 'student', attributes: ['code', 'program'] }
            //         ],
            //         attributes: ['id', 'name', 'email']
            //     }
            // ]
        });
        if (!subject) {
            throw new Error('Asignatura no encontrada.');
        }
        return subject;
    },

    async updateSubject(id, updateData) {
        const subject = await Subject.findByPk(id);
        if (!subject) {
            throw new Error('Asignatura no encontrada.');
        }
        await subject.update(updateData);
        return subject;
    },

    async deleteSubject(id) {
        const subject = await Subject.findByPk(id);
        if (!subject) {
            throw new Error('Asignatura no encontrada.');
        }
        await subject.destroy();
        return { message: 'Asignatura eliminada exitosamente.' };
    },

    // Métodos para asociar/desasociar usuarios (profesores/estudiantes) a asignaturas
    async addUserToSubject(userId, subjectId) {
        const user = await User.findByPk(userId);
        const subject = await Subject.findByPk(subjectId);
        if (!user || !subject) {
            throw new Error('Usuario o Asignatura no encontrados.');
        }
        // addSubject es un método de Sequelize generado por belongsToMany
        await user.addSubject(subject); 
        return { message: `Usuario ${userId} asociado a asignatura ${subjectId} exitosamente.` };
    },

    async removeUserFromSubject(userId, subjectId) {
        const user = await User.findByPk(userId);
        const subject = await Subject.findByPk(subjectId);
        if (!user || !subject) {
            throw new Error('Usuario o Asignatura no encontrados.');
        }
        // removeSubject es un método de Sequelize generado por belongsToMany
        await user.removeSubject(subject);
        return { message: `Usuario ${userId} desasociado de asignatura ${subjectId} exitosamente.` };
    },

    async getSubjectsByUser(userId) {
        const user = await User.findByPk(userId, {
            include: [{ model: Subject, as: 'subjects', through: { attributes: [] } }] // No incluir la tabla intermedia
        });
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }
        return user.subjects;
    },
    /**
     * Obtiene los docentes asociados a una asignatura específica.
     * @param {number} subjectId - ID de la asignatura.
     * @returns {Promise<Array>} Lista de objetos de usuario (docentes) con sus perfiles de profesor.
     */
     async getTeachersBySubject(subjectId) {
        const subject = await Subject.findByPk(subjectId, {
            include: [
                {
                    model: User,
                    as: 'users',
                    through: { attributes: [] },
                    // Eliminamos el 'where' de aquí
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['name'],
                            where: { name: 'teacher' }, // <-- ¡MOVEMOS EL FILTRO AQUÍ!
                            required: true // <-- ¡FORZAMOS UN INNER JOIN para la tabla Role!
                        },
                        { model: Professor, as: 'professor' }
                    ],
                    required: true // <-- ¡FORZAMOS UN INNER JOIN para la tabla User!
                }
            ]
        });

        if (!subject) {
            throw new Error('Asignatura no encontrada.');
        }
        
        // Devolver solo los usuarios (profesores) asociados, con sus perfiles
        return subject.users.map(user => {
            const userJson = user.toJSON();
            delete userJson.password;
            return userJson;
        });
    }
};

module.exports = subjectService;