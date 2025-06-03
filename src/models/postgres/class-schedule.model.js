// src/models/postgres/class-schedule.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const DayOfWeek = require('../../enums/day-of-week.enum');

const ClassSchedule = sequelize.define('ClassSchedule', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subject_id',
        // Referencia se definirá en app.js
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        // Referencia se definirá en app.js
    },
    dayOfWeek: {
        type: DataTypes.ENUM(...Object.values(DayOfWeek)),
        allowNull: false,
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
    classroom: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'ClassSchedules',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            unique: false,
            fields: ['user_id', 'day_of_week', 'start_time', 'end_time']
        }
    ]
});

// ClassSchedule.associate = (models) => {
//     ClassSchedule.belongsTo(models.Subject, { foreignKey: 'subjectId', as: 'subject' });
//     ClassSchedule.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
// };

module.exports = ClassSchedule;