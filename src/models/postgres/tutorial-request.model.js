// src/models/postgres/tutoring-request.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const RequestStatus = require('../../enums/request-status.enum');

const TutoringRequest = sequelize.define('TutoringRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: { // ID del estudiante que solicita
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
    },
    teacherId: { // ID del profesor al que se solicita
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id',
    },
    subjectId: { // Asignatura de la tutoría
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subject_id',
    },
    requestDate: { // Fecha en que se realizó la solicitud
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'request_date',
    },
    desiredDate: { // Fecha deseada para la tutoría
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'desired_date',
    },
    startTime: { // Hora de inicio deseada
        type: DataTypes.TIME,
        allowNull: false,
        field: 'start_time',
    },
    endTime: { // Hora de fin deseada
        type: DataTypes.TIME,
        allowNull: false,
        field: 'end_time',
    },
    message: { // Mensaje del estudiante al docente
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(RequestStatus)),
        defaultValue: RequestStatus.PENDING,
        allowNull: false,
    },
    rejectionReason: { // Razón del rechazo (si aplica)
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason',
    }
}, {
    tableName: 'TutoringRequests',
    timestamps: false, // Puedes añadir createdAt/updatedAt si lo deseas
    underscored: true,
    validate: {
        endTimeAfterStartTime() {
            if (this.startTime && this.endTime) {
                const [sh, sm, ss] = this.startTime.split(':').map(Number);
                const [eh, em, es] = this.endTime.split(':').map(Number);
                const startDate = new Date(2000, 0, 1, sh, sm, ss);
                const endDate = new Date(2000, 0, 1, eh, em, es);
                if (startDate >= endDate) {
                    throw new Error('La hora de fin debe ser posterior a la hora de inicio.');
                }
            }
        },
        maxDurationConstraint() {
            // Un ejemplo para la duración máxima de 2 horas (120 minutos)
            const maxDurationMinutes = 120; // 2 horas
            if (this.startTime && this.endTime) {
                const [sh, sm] = this.startTime.split(':').map(Number);
                const [eh, em] = this.endTime.split(':').map(Number);

                const startMinutes = sh * 60 + sm;
                const endMinutes = eh * 60 + em;

                let duration = endMinutes - startMinutes;
                if (duration < 0) { // Manejar casos que cruzan la medianoche si es necesario, aunque en tutorías es raro
                    duration += 24 * 60;
                }

                if (duration > maxDurationMinutes) {
                    throw new Error(`La duración de la tutoría no puede exceder las ${maxDurationMinutes / 60} horas.`);
                }
            }
        }
    }
});

module.exports = TutoringRequest;