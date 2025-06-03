// src/models/postgres/subject.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    area: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    }
}, {
    tableName: 'Subjects',
    timestamps: false,
    underscored: true,
});

// Subject.associate = (models) => {
//     Subject.hasMany(models.ClassSchedule, { foreignKey: 'subjectId', as: 'classSchedules' });
//     Subject.belongsToMany(models.User, { through: models.UserSubject, foreignKey: 'subjectId', as: 'users' });
// };

module.exports = Subject;