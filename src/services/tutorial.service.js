// src/services/tutorial.service.js
const TutoringRequest = require('../models/postgres/tutorial-request.model');
const Tutoring = require('../models/postgres/tutorial.model'); // <-- ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE Y SIN COMENTAR!
const StudentModel = require('../models/postgres/student.model');
const ProfessorModel = require('../models/postgres/professor.model');
const SubjectModel = require('../models/postgres/subject.model');
const User = require('../models/postgres/user.model'); // Para includes
const scheduleService = require('./schedule.service'); // Para las validaciones de horario
const RequestStatus = require('../enums/request-status.enum');
const TutoringStatus = require('../enums/tutoring-status.enum');
const { sequelize } = require('../config/database'); // Para transacciones

const NotificationService = require('./notification.service'); // <-- NUEVO
const NotificationType = require('../enums/notification-type.enum'); // <-- NUEVO

// Instanciar el servicio de notificaciones (Singleton)
const notificationServiceInstance = new NotificationService();

const tutorialService = { // Usaré 'tutorialService' para coherencia con la estructura de archivos 'tutorial.service.js'
    async createTutoringRequest(requestData) {
        const t = await sequelize.transaction();
        try {
            const { studentId, teacherId, subjectId, desiredDate, startTime, endTime, message } = requestData;

            const studentProfile = await StudentModel.findByPk(studentId, { include: { model: User, as: 'user' } });
            const teacherProfile = await ProfessorModel.findByPk(teacherId, { include: { model: User, as: 'user' } });
            const subjectData = await SubjectModel.findByPk(subjectId);

            if (!studentProfile || !studentProfile.user || !teacherProfile || !teacherProfile.user || !subjectData) {
                throw new Error('Estudiante, docente o asignatura no encontrados.');
            }

            // 2. Validar conflicto de tutorías del estudiante (Restricción 1)
            // Aquí se usa Tutoring dentro de scheduleService.validateStudentTutoringConflict
            const studentTutoringConflict = await scheduleService.validateStudentTutoringConflict(studentId, desiredDate, startTime, endTime);
            if (studentTutoringConflict) {
                throw new Error('El estudiante ya tiene una tutoría agendada que se superpone con este horario.');
            }

            // 3. Validar conflicto con horario de clases del estudiante (Restricción 2 - con advertencia)
            const studentClassConflict = await scheduleService.validateStudentClassConflict(studentId, desiredDate, startTime, endTime);
            // Si hay conflicto de clase, creamos la solicitud y mandamos la advertencia, pero permitimos la creación.
            if (studentClassConflict) {
                const newRequest = await TutoringRequest.create({
                    studentId, teacherId, subjectId, desiredDate, startTime, endTime, message,
                    status: RequestStatus.PENDING
                }, { transaction: t });
                await t.commit();
                
                // Notificar al docente sobre la nueva solicitud pendiente (opcional, podrías hacer otra notificación)
                await notificationServiceInstance.sendNotification(
                    NotificationType.PENDING_REQUEST,
                    teacherProfile.userId,
                    `Nueva solicitud de tutoría de ${studentProfile.user.name} para ${subjectData.name}.`,
                    { requestId: newRequest.id, studentName: studentProfile.user.name, subjectName: subjectData.name }
                );

                return { newRequest, warning: 'El estudiante tiene clases en este horario. ¿Está seguro de agendar la tutoría?' };
            }

            // 4. Validar disponibilidad del profesor (Restricción 3)
            // Aquí se usa Tutoring dentro de scheduleService.validateTeacherAvailability
            const teacherAvailable = await scheduleService.validateTeacherAvailability(teacherId, desiredDate, startTime, endTime);
            if (!teacherAvailable) {
                throw new Error('El docente no tiene disponibilidad o ya tiene otra tutoría agendada en el horario solicitado.');
            }

            // Si todas las validaciones pasan, crear la solicitud
            const newRequest = await TutoringRequest.create({
                studentId, teacherId, subjectId, desiredDate, startTime, endTime, message,
                status: RequestStatus.PENDING
            }, { transaction: t });

            await t.commit();

            // Notificar al docente sobre la nueva solicitud pendiente
            await notificationServiceInstance.sendNotification(
                NotificationType.PENDING_REQUEST,
                teacherProfile.userId,
                `Nueva solicitud de tutoría de ${studentProfile.user.name} para ${subjectData.name}.`,
                { requestId: newRequest.id, studentName: studentProfile.user.name, subjectName: subjectData.name }
            );

            return { newRequest };

        } catch (error) {
            await t.rollback();
            console.error('Error en tutorialService.createTutoringRequest:', error);
            throw error;
        }
    },

    async getTutoringRequests(filters = {}) {
        const where = {};
        if (filters.studentId) where.studentId = filters.studentId;
        if (filters.teacherId) where.teacherId = filters.teacherId;
        if (filters.status) where.status = filters.status;

        const requests = await TutoringRequest.findAll({
            where,
            include: [
                { model: StudentModel, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                { model: SubjectModel, as: 'subject', attributes: ['name', 'code'] }
            ],
            order: [['requestDate', 'DESC']]
        });
        return requests;
    },

    async getTutoringRequestById(id) {
        const request = await TutoringRequest.findByPk(id, {
            include: [
                { 
                    model: StudentModel, 
                    as: 'student', 
                    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
                    required: true 
                },
                { 
                    model: ProfessorModel, 
                    as: 'teacher', 
                    include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
                    required: true 
                },
                { 
                    model: SubjectModel, 
                    as: 'subject', 
                    attributes: ['name', 'code'],
                    required: true 
                }
            ]
        });
        if (!request) {
            throw new Error('Solicitud de tutoría no encontrada.');
        }
        return request;
    },

    async processTutoringRequest(requestId, status, rejectionReason = null) {
        const t = await sequelize.transaction();
        try {
            const request = await TutoringRequest.findByPk(requestId, {
                include: [
                    { model: StudentModel, as: 'student', include: [{ model: User, as: 'user' }] },
                    { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user' }] },
                    { model: SubjectModel, as: 'subject' }
                ]
            }, { transaction: t });

            if (!request) {
                throw new Error('Solicitud de tutoría no encontrada.');
            }

            if (request.status !== RequestStatus.PENDING) {
                throw new Error('La solicitud ya ha sido procesada.');
            }

            const studentUser = request.student.user;
            const teacherUser = request.teacher.user;
            const subjectName = request.subject.name;
            const tutoringDate = request.desiredDate;
            const tutoringTime = `${request.startTime.substring(0, 5)} - ${request.endTime.substring(0, 5)}`;


            // Lógica para APROBACIÓN
            if (status === RequestStatus.APPROVED) {
                // Revalidar disponibilidad del profesor justo antes de aprobar
                const teacherAvailable = await scheduleService.validateTeacherAvailability(request.teacherId, request.desiredDate, request.startTime, request.endTime);
                if (!teacherAvailable) {
                    throw new Error('El docente ya no tiene disponibilidad para este horario. No se puede aprobar.');
                }
                
                // Crear la tutoría en la tabla Tutorings
                const newTutoring = await Tutoring.create({
                    studentId: request.studentId,
                    teacherId: request.teacherId,
                    subjectId: request.subjectId,
                    startDate: new Date(`${request.desiredDate}T${request.startTime}`),
                    endDate: new Date(`${request.desiredDate}T${request.endTime}`),
                    status: TutoringStatus.SCHEDULED,
                    tutoringRequestId: request.id,
                }, { transaction: t });

                // --- Bloquear la disponibilidad del profesor ---
                const matchingAvailableSchedule = await Tutoring.findMatchingAvailableSchedule(newTutoring, t);
                if (matchingAvailableSchedule) {
                    await matchingAvailableSchedule.block(t); // Usar el método block del modelo
                    console.log(`Disponibilidad ${matchingAvailableSchedule.id} bloqueada para el profesor ${request.teacherId}.`);
                } else {
                    // Esto no debería pasar si validateTeacherAvailability fue true
                    console.warn(`Advertencia: No se encontró un slot de disponibilidad exacto para la tutoría ${newTutoring.id} al aprobarla.`);
                }
                // --- Fin Bloqueo de Disponibilidad ---

                request.status = RequestStatus.APPROVED;
                await request.save({ transaction: t });
                
                await t.commit();

                // Notificación al estudiante: SOLICITUD APROBADA
                await notificationServiceInstance.sendNotification(
                    NotificationType.REQUEST_APPROVED,
                    studentUser.id,
                    `Tu solicitud de tutoría para ${subjectName} ha sido APROBADA.`,
                    { 
                        tutoringId: newTutoring.id,
                        studentName: studentUser.name,
                        teacherName: teacherUser.name,
                        subjectName: subjectName,
                        date: tutoringDate,
                        time: tutoringTime
                    }
                );

                return { request, tutoring: newTutoring };
            } 
            // Lógica para RECHAZO
            else if (status === RequestStatus.REJECTED) {
                // ... (código existente sin cambios) ...
                request.status = RequestStatus.REJECTED;
                request.rejectionReason = rejectionReason;
                await request.save({ transaction: t });
                await t.commit();

                await notificationServiceInstance.sendNotification(
                    NotificationType.REQUEST_REJECTED,
                    studentUser.id,
                    `Tu solicitud de tutoría para ${subjectName} ha sido RECHAZADA. Razón: ${rejectionReason}`,
                    { 
                        studentName: studentUser.name,
                        teacherName: teacherUser.name,
                        subjectName: subjectName,
                        date: tutoringDate,
                        time: tutoringTime,
                        rejectionReason: rejectionReason
                    }
                );
                return { request };
            } 
            // Lógica para CANCELACIÓN (por estudiante o admin antes de ser aprobada)
            else if (status === RequestStatus.CANCELLED) {
                 request.status = RequestStatus.CANCELLED;
                 request.rejectionReason = rejectionReason || 'Cancelada por el solicitante/sistema';
                 await request.save({ transaction: t });
                 await t.commit();
                 
                 await notificationServiceInstance.sendNotification(
                    NotificationType.CANCELLATION,
                    teacherUser.id,
                    `La solicitud de tutoría de ${studentUser.name} para ${subjectName} ha sido CANCELADA.`,
                    { 
                        studentName: studentUser.name,
                        teacherName: teacherUser.name,
                        subjectName: subjectName,
                        date: tutoringDate,
                        time: tutoringTime,
                        cancellationReason: rejectionReason || 'Estudiante/Sistema'
                    }
                 );

                 return { request };
            }
            else {
                throw new Error('Estado de procesamiento de solicitud no válido.');
            }

        } catch (error) {
            await t.rollback();
            console.error('Error en tutorialService.processTutoringRequest:', error.message);
            throw error;
        }
    },

    async cancelTutoring(tutoringId, userId, reason = null) {
        const t = await sequelize.transaction();
        try {
            const tutoring = await Tutoring.findByPk(tutoringId, { 
                include: [
                    { model: StudentModel, as: 'student', include: [{ model: User, as: 'user' }] },
                    { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user' }] },
                    { model: SubjectModel, as: 'subject' }
                ]
            }, { transaction: t });

            if (!tutoring) {
                throw new Error('Tutoría no encontrada.');
            }
            
            if (tutoring.status !== TutoringStatus.SCHEDULED && tutoring.status !== TutoringStatus.IN_PROGRESS) {
                throw new Error(`La tutoría con estado ${tutoring.status} no puede ser cancelada.`);
            }

            tutoring.status = TutoringStatus.CANCELLED;
            tutoring.observations = reason || 'Cancelada por el usuario';
            await tutoring.save({ transaction: t });
            
            // --- Liberar la disponibilidad del profesor al cancelar ---
            const matchingAvailableSchedule = await Tutoring.findMatchingAvailableSchedule(tutoring, t);
            if (matchingAvailableSchedule) {
                await matchingAvailableSchedule.release(t); // Usar el método release del modelo
                console.log(`Disponibilidad ${matchingAvailableSchedule.id} liberada para el profesor ${tutoring.teacherId}.`);
            } else {
                console.warn(`Advertencia: No se encontró un slot de disponibilidad para liberar al cancelar la tutoría ${tutoring.id}.`);
            }
            // --- Fin Liberación de Disponibilidad ---

            if (tutoring.tutoringRequestId) {
                const request = await TutoringRequest.findByPk(tutoring.tutoringRequestId, { transaction: t });
                if (request && request.status === RequestStatus.APPROVED) {
                    request.status = RequestStatus.CANCELLED;
                    request.rejectionReason = reason || 'Tutoría asociada cancelada';
                    await request.save({ transaction: t });
                }
            }

            await t.commit();

            // Notificación al estudiante y al docente sobre la cancelación de la tutoría agendada
            const studentUser = tutoring.student.user;
            const teacherUser = tutoring.teacher.user;
            const subjectName = tutoring.subject.name;
            const tutoringDate = tutoring.startDate.toISOString().split('T')[0];
            const tutoringTime = `${tutoring.startDate.toTimeString().substring(0, 5)} - ${tutoring.endDate.toTimeString().substring(0, 5)}`;


            const messageContent = `La tutoría de ${subjectName} el ${tutoringDate} (${tutoringTime}) ha sido cancelada. Razón: ${reason || 'No especificada.'}`;
            const metadata = {
                tutoringId: tutoring.id,
                studentName: studentUser.name,
                teacherName: teacherUser.name,
                subjectName: subjectName,
                date: tutoringDate,
                time: tutoringTime,
                cancellationReason: reason
            };

            await notificationServiceInstance.sendNotification(NotificationType.CANCELLATION, studentUser.id, messageContent, metadata);
            await notificationServiceInstance.sendNotification(NotificationType.CANCELLATION, teacherUser.id, messageContent, metadata);


            return { message: 'Tutoría cancelada exitosamente.', tutoring };

        } catch (error) {
            await t.rollback();
            console.error('Error en tutorialService.cancelTutoring:', error.message);
            throw error;
        }
    },

    // --- NUEVO MÉTODO: Marcar Asistencia/Estado de Tutoría ---
    async markTutoringSession(tutoringId, status, observations = null) {
        const t = await sequelize.transaction();
        try {
            const tutoring = await Tutoring.findByPk(tutoringId, { transaction: t });

            if (!tutoring) {
                throw new Error('Tutoría no encontrada.');
            }

            if (![TutoringStatus.COMPLETED, TutoringStatus.NO_SHOW].includes(status)) {
                throw new Error('Estado de marcación de sesión no válido. Solo se permite COMPLETED o NO_SHOW.');
            }
            if (tutoring.status !== TutoringStatus.SCHEDULED && tutoring.status !== TutoringStatus.IN_PROGRESS) {
                 throw new Error(`La tutoría con estado ${tutoring.status} no puede ser marcada como ${status}.`);
            }

            tutoring.status = status;
            tutoring.observations = observations || tutoring.observations; // Actualizar observaciones
            await tutoring.save({ transaction: t });

            await t.commit();
            return { message: `Tutoría marcada como ${status} exitosamente.`, tutoring };

        } catch (error) {
            await t.rollback();
            console.error('Error en tutorialService.markTutoringSession:', error.message);
            throw error;
        }
    },

    async getTutorings(filters = {}) {
        const where = {};
        if (filters.studentId) where.studentId = filters.studentId;
        if (filters.teacherId) where.teacherId = filters.teacherId;
        if (filters.status) where.status = filters.status;

        // Aquí se usa Tutoring.findAll
        const tutorings = await Tutoring.findAll({
            where,
            include: [
                { model: StudentModel, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                { model: ProfessorModel, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
                { model: SubjectModel, as: 'subject', attributes: ['name', 'code'] }
            ],
            order: [['startDate', 'DESC']]
        });
        return tutorings;
    },
};

module.exports = tutorialService;