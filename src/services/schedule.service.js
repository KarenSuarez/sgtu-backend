// src/services/schedule.service.js
const ClassSchedule = require('../models/postgres/class-schedule.model');
const AvailableSchedule = require('../models/postgres/availability-schedule.model');
const User = require('../models/postgres/user.model');
const Subject = require('../models/postgres/subject.model');
const Professor = require('../models/postgres/professor.model');
const Tutoring = require('../models/postgres/tutorial.model');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize'); 


const scheduleService = {
    async createClassSchedule(scheduleData) {
        try {
            // Puedes añadir validaciones de lógica de negocio aquí, ej.
            // que la hora de fin sea después de la hora de inicio,
            // o que no haya superposición con otros horarios del mismo usuario.
            const newSchedule = await ClassSchedule.create(scheduleData);
            return newSchedule;
        } catch (error) {
            throw new Error(`Error al crear el horario de clase: ${error.message}`);
        }
    },

    async getAllClassSchedules() {
        const schedules = await ClassSchedule.findAll({
            include: [
                { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
        return schedules;
    },

    async getClassScheduleById(id) {
        const schedule = await ClassSchedule.findByPk(id, {
            include: [
                { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
        if (!schedule) {
            throw new Error('Horario de clase no encontrado.');
        }
        return schedule;
    },

    async updateClassSchedule(id, updateData) {
        const schedule = await ClassSchedule.findByPk(id);
        if (!schedule) {
            throw new Error('Horario de clase no encontrado.');
        }
        await schedule.update(updateData);
        return schedule;
    },

    async deleteClassSchedule(id) {
        const schedule = await ClassSchedule.findByPk(id);
        if (!schedule) {
            throw new Error('Horario de clase no encontrado.');
        }
        await schedule.destroy();
        return { message: 'Horario de clase eliminado exitosamente.' };
    },

    async getClassSchedulesByUser(userId) {
        const schedules = await ClassSchedule.findAll({
            where: { userId },
            include: [
                { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] }
            ],
            order: [
                ['dayOfWeek', 'ASC'], // Ordenar por día de la semana
                ['startTime', 'ASC']  // Luego por hora de inicio
            ]
        });
        return schedules;
    },
      async createAvailabilitySchedule(availabilityData) {
        try {
            const newAvailability = await AvailableSchedule.create(availabilityData);
            return newAvailability;
        } catch (error) {
            if (error.name === 'SequelizeValidationError' && error.message.includes('Validation error:')) {
                throw new Error(error.errors[0].message); // Captura los errores de validación de Sequelize (ej. eitherDayOrDate)
            }
            throw new Error(`Error al crear el horario de disponibilidad: ${error.message}`);
        }
    },

    async getAllAvailabilitySchedules() {
        const schedules = await AvailableSchedule.findAll({
            include: [
                { model: Professor, as: 'teacher', attributes: ['id', 'teacherCode', 'area'] }
            ]
        });
        return schedules;
    },

    async getAvailabilityScheduleById(id) {
        const schedule = await AvailableSchedule.findByPk(id, {
            include: [
                { model: Professor, as: 'teacher', attributes: ['id', 'teacherCode', 'area'] }
            ]
        });
        if (!schedule) {
            throw new Error('Horario de disponibilidad no encontrado.');
        }
        return schedule;
    },

    async updateAvailabilitySchedule(id, updateData) {
        const schedule = await AvailableSchedule.findByPk(id);
        if (!schedule) {
            throw new Error('Horario de disponibilidad no encontrado.');
        }
        try {
            await schedule.update(updateData);
            return schedule;
        } catch (error) {
             if (error.name === 'SequelizeValidationError' && error.message.includes('Validation error:')) {
                throw new Error(error.errors[0].message); // Captura los errores de validación de Sequelize
            }
            throw new Error(`Error al actualizar el horario de disponibilidad: ${error.message}`);
        }
    },

    async deleteAvailabilitySchedule(id) {
        const schedule = await AvailableSchedule.findByPk(id);
        if (!schedule) {
            throw new Error('Horario de disponibilidad no encontrado.');
        }
        await schedule.destroy();
        return { message: 'Horario de disponibilidad eliminado exitosamente.' };
    },

    async getAvailabilitySchedulesByTeacher(teacherId) {
        const schedules = await AvailableSchedule.findAll({
            where: { teacherId },
            order: [
                ['dayOfWeek', 'ASC'],
                ['specificDate', 'ASC'],
                ['startTime', 'ASC']
            ]
        });
        return schedules;
    },
    /**
     * Valida si un estudiante tiene una tutoría superpuesta en el horario deseado.
     * Restricción: Un estudiante no puede tener tutorías superpuestas en el horario.
     * @param {number} studentId - ID del estudiante.
     * @param {string} desiredDate - Fecha deseada (YYYY-MM-DD).
     * @param {string} startTime - Hora de inicio deseada (HH:MM:SS).
     * @param {string} endTime - Hora de fin deseada (HH:MM:SS).
     * @returns {Promise<boolean>} true si hay conflicto, false si no.
     */
    async validateStudentTutoringConflict(studentId, desiredDate, startTime, endTime) {
        // Convertir fecha y hora a objetos Date para comparación
        const startDateTime = new Date(`${desiredDate}T${startTime}`);
        const endDateTime = new Date(`${desiredDate}T${endTime}`);

        const existingTutorings = await Tutoring.findAll({ // <-- Aquí es donde se usaba Tutoring
            where: {
                studentId: studentId,
                status: ['SCHEDULED', 'IN_PROGRESS'], // Solo tutorías activas
                // Filtro por fecha, aunque la lógica completa de superposición se hace en el bucle
                startDate: {
                    [require('sequelize').Op.lt]: endDateTime // Tutorías que empiezan antes de que termine la solicitada
                },
                endDate: {
                    [require('sequelize').Op.gt]: startDateTime // Tutorías que terminan después de que empiece la solicitada
                }
            }
        });

        // Este bucle es necesario porque los Op.lt/gt solo filtran, no validan superposición exacta
        for (const tutoring of existingTutorings) {
            const existingStart = tutoring.startDate;
            const existingEnd = tutoring.endDate;

            // Condición para superposición:
            // (Inicio existente < Fin nuevo) AND (Fin existente > Inicio nuevo)
            if (existingStart < endDateTime && existingEnd > startDateTime) {
                return true; // Conflicto detectado
            }
        }
        return false; // No hay conflicto
    },

    /**
     * Valida si la hora deseada de tutoría coincide con el horario de clases del estudiante.
     * Restricción: Un estudiante puede agendar una tutoria aunque tenga clase a esa hora,
     * pero el sistema debe preguntar si esta seguro que desea agendar tutoria en horario de clase.
     * @param {number} userId - ID del usuario (estudiante).
     * @param {string} desiredDate - Fecha deseada (YYYY-MM-DD).
     * @param {string} startTime - Hora de inicio deseada (HH:MM:SS).
     * @param {string} endTime - Hora de fin deseada (HH:MM:SS).
     * @returns {Promise<boolean>} true si hay conflicto con clase, false si no.
     */
    async validateStudentClassConflict(userId, desiredDate, startTime, endTime) {
        // ... (resto del código sin cambios)
    },

    /**
     * Valida si el profesor tiene disponibilidad para la hora deseada.
     * @param {number} teacherId - ID del profesor.
     * @param {string} desiredDate - Fecha deseada (YYYY-MM-DD).
     * @param {string} startTime - Hora de inicio deseada (HH:MM:SS).
     * @param {string} endTime - Hora de fin deseada (HH:MM:SS).
     * @returns {Promise<boolean>} true si el profesor está disponible, false si no.
     */
    /**
     * Valida si el profesor tiene disponibilidad para la hora deseada.
     * Esta función solo verifica la existencia de un slot disponible y la ausencia de superposición con OTRAS tutorías.
     * NO CAMBIA EL ESTADO DE DISPONIBILIDAD. El cambio de estado se hará en el tutorialService.
     * @param {number} teacherId - ID del profesor.
     * @param {string} desiredDate - Fecha deseada (YYYY-MM-DD).
     * @param {string} startTime - Hora de inicio deseada (HH:MM:SS).
     * @param {string} endTime - Hora de fin deseada (HH:MM:SS).
     * @returns {Promise<boolean>} true si el profesor tiene un slot disponible y no hay conflicto, false si no.
     */
    async validateTeacherAvailability(teacherId, desiredDate, startTime, endTime) {
        console.log("\nBACKEND DEBUG: --- validateTeacherAvailability llamada ---");
        console.log("BACKEND DEBUG: Entrada - teacherId:", teacherId, "desiredDate:", desiredDate, "startTime:", startTime, "endTime:", endTime);

        const date = new Date(desiredDate + 'T00:00:00Z'); 
        
        if (isNaN(date.getTime())) {
            console.error("BACKEND DEBUG: Fecha deseada inválida después de la corrección de timezone:", desiredDate);
            return false;
        }

        const dayOfWeekIndex = date.getUTCDay();
        
        const dayOfWeekMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayOfWeek = dayOfWeekMap[dayOfWeekIndex];
        console.log("BACKEND DEBUG: Día de la semana calculado de desiredDate (UTC):", dayOfWeek);

        const newStartMinutes = this._timeToMinutes(startTime);
        const newEndMinutes = this._timeToMinutes(endTime);

        const availabilities = await AvailableSchedule.findAll({
            where: {
                teacherId: teacherId,
                available: true,
                [Op.or]: [ // <-- ¡USAR 'Op' IMPORTADO DIRECTAMENTE!
                    { dayOfWeek: dayOfWeek, specificDate: null },
                    { specificDate: desiredDate, dayOfWeek: null } 
                ]
            }
        });
        console.log("BACKEND DEBUG: Slots de disponibilidad RAW encontrados en DB para el filtro:", JSON.stringify(availabilities));
        console.log("BACKEND DEBUG: Total de slots RAW encontrados:", availabilities.length);

        let isSlotAvailableAndNoConflict = false;
        for (const avail of availabilities) {
            console.log(`BACKEND DEBUG: --- Verificando slot de disponibilidad ID: ${avail.id} ---`);
            const availStartMinutes = this._timeToMinutes(avail.startTime);
            const availEndMinutes = this._timeToMinutes(avail.endTime);
            console.log(`BACKEND DEBUG: Slot de disponibilidad [ID: ${avail.id}] - Rango: ${avail.startTime}-${avail.endTime} (${availStartMinutes}-${availEndMinutes} mins)`);
            console.log(`BACKEND DEBUG: Rango de tutoría solicitado: ${startTime}-${endTime} (${newStartMinutes}-${newEndMinutes} mins)`);

            if (newStartMinutes >= availStartMinutes && newEndMinutes <= availEndMinutes) {
                console.log(`BACKEND DEBUG: Rango solicitado (${startTime}-${endTime}) CUMPLE dentro del slot de disponibilidad ID: ${avail.id}.`);
                
                const conflictWithExistingTutoring = await Tutoring.findOne({
                    where: {
                        teacherId: teacherId,
                        status: ['SCHEDULED', 'IN_PROGRESS'],
                        startDate: {
                            [Op.lt]: new Date(`${desiredDate}T${endTime}Z`) // <-- ¡USAR 'Op' IMPORTADO DIRECTAMENTE!
                        },
                        endDate: {
                            [Op.gt]: new Date(`${desiredDate}T${startTime}Z`) // <-- ¡USAR 'Op' IMPORTADO DIRECTAMENTE!
                        }
                    }
                });
                console.log("BACKEND DEBUG: Conflicto con tutoría EXISTENTE encontrado (ID):", conflictWithExistingTutoring ? conflictWithExistingTutoring.id : "Ninguno");

                if (!conflictWithExistingTutoring) {
                    console.log(`BACKEND DEBUG: No hay conflicto con tutoría existente para slot ID: ${avail.id}. ESTE SLOT ES VÁLIDO.`);
                    isSlotAvailableAndNoConflict = true;
                    break;
                } else {
                    console.log(`BACKEND DEBUG: Conflicto ENCONTRADO con tutoría ID: ${conflictWithExistingTutoring.id}. Este slot de disponibilidad no es útil.`);
                }
            } else {
                console.log(`BACKEND DEBUG: Rango solicitado (${startTime}-${endTime}) NO CUMPLE dentro del slot de disponibilidad ID: ${avail.id}.`);
            }
        }
        console.log("BACKEND DEBUG: --- Fin verificación de disponibilidad ---");
        console.log("BACKEND DEBUG: Resultado final de validateTeacherAvailability:", isSlotAvailableAndNoConflict);
        return isSlotAvailableAndNoConflict;
    },

    // --- Función auxiliar privada ---
    _timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }
};

module.exports = scheduleService;