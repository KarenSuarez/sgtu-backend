// src/models/postgres/availability-schedule.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const DayOfWeek = require('../../enums/day-of-week.enum');

const AvailableSchedule = sequelize.define('AvailableSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'teacher_id',
    },
    dayOfWeek: {
        type: DataTypes.ENUM(...Object.values(DayOfWeek)),
        allowNull: true,
        field: 'day_of_week',
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'start_time',
    },
    endTime: {
        type: DataTypes.TIME,
        allowNull: false,
        field: 'end_time',
    },
    specificDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'specific_date',
    },
    available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, {
    tableName: 'AvailableSchedules',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            name: 'idx_teacher_day_date_start',
            unique: false,
            fields: ['teacher_id', 'day_of_week', 'specific_date', 'start_time']
        }
    ],
    validate: {
        eitherDayOrDate() {
            const hasDay = Boolean(this.dayOfWeek);
            const hasDate = Boolean(this.specificDate);

            if (!hasDay && !hasDate) {
                throw new Error('Debe proporcionar un día de la semana o una fecha específica.');
            }
            if (hasDay && hasDate) {
                 throw new Error('No se puede proporcionar un día de la semana y una fecha específica al mismo tiempo.');
            }
        },
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
        }
    }
});

// --- NUEVOS MÉTODOS DE INSTANCIA ---
AvailableSchedule.prototype.block = async function(transaction) {
    if (this.available === false) {
        throw new Error('El horario de disponibilidad ya está bloqueado.');
    }
    this.available = false;
    await this.save({ transaction });
    return this;
};

AvailableSchedule.prototype.release = async function(transaction) {
    if (this.available === true) {
        throw new Error('El horario de disponibilidad ya está libre.');
    }
    this.available = true;
    await this.save({ transaction });
    return this;
};


module.exports = AvailableSchedule;