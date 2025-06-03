// sgtu-backend/src/models/postgres/tutorial.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database'); // Importa la instancia de Sequelize
const { Op } = require('sequelize'); // <-- ¡AÑADIR ESTA LÍNEA para importar Op directamente!
const TutoringStatus = require('../../enums/tutoring-status.enum');
const DayOfWeek = require('../../enums/day-of-week.enum');

const Tutoring = sequelize.define('Tutoring', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id',
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subject_id',
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_date',
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_date',
    },
    status: {
        type: DataTypes.ENUM(...Object.values(TutoringStatus)),
        defaultValue: TutoringStatus.SCHEDULED,
        allowNull: false,
    },
    observations: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    resources: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
    },
    tutoringRequestId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tutoring_request_id',
        unique: true,
    },
}, {
    tableName: 'Tutorings',
    timestamps: false,
    underscored: true,
    validate: {
        endTimeAfterStartTimeTutoring() {
            if (this.startDate && this.endDate && this.startDate >= this.endDate) {
                throw new Error('La fecha y hora de fin de la tutoría deben ser posteriores a la de inicio.');
            }
        },
        maxDurationConstraintTutoring() {
            const maxDurationMinutes = 120;
            if (this.startDate && this.endDate) {
                const durationMs = this.endDate.getTime() - this.startDate.getTime();
                const durationMinutes = durationMs / (1000 * 60);

                if (durationMinutes > maxDurationMinutes) {
                    throw new Error(`La duración de la tutoría no puede exceder las ${maxDurationMinutes / 60} horas.`);
                }
            }
        }
    }
});

Tutoring.findMatchingAvailableSchedule = async function(tutoringInstance, transaction = null) {
    const AvailableSchedule = require('./availability-schedule.model'); 

    const desiredDate = tutoringInstance.startDate.toISOString().split('T')[0];
    const startTime = tutoringInstance.startDate.toTimeString().substring(0, 8);
    const endTime = tutoringInstance.endDate.toTimeString().substring(0, 8);

    const [year, month, day] = desiredDate.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeekIndex = date.getUTCDay();
    const dayOfWeekMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayOfWeekMap[dayOfWeekIndex];

    const matchingSchedule = await AvailableSchedule.findOne({
        where: {
            teacherId: tutoringInstance.teacherId,
            startTime: startTime,
            endTime: endTime,
            [Op.or]: [ // <-- ¡USAR 'Op' IMPORTADO DIRECTAMENTE AQUÍ!
                { dayOfWeek: dayOfWeek, specificDate: null },
                { specificDate: desiredDate, dayOfWeek: null }
            ],
            available: true
        },
        transaction
    });

    return matchingSchedule;
};

module.exports = Tutoring;