// src/models/postgres/user.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const UserState = require('../../enums/user-state.enum');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    creationDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'creation_date',
    },
    status: {
        type: DataTypes.ENUM(...Object.values(UserState)),
        defaultValue: UserState.ACTIVE,
        allowNull: false,
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id',
        // Referencia se definirá en app.js para evitar circularidad
    }
}, {
    tableName: 'Users',
    timestamps: false,
    underscored: true,
});

// User.associate = (models) => {
//     User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
//     User.hasOne(models.Student, { foreignKey: 'userId', as: 'student' });
//     User.hasOne(models.Professor, { foreignKey: 'userId', as: 'professor' });
//     User.hasMany(models.ClassSchedule, { foreignKey: 'userId', as: 'classSchedules' });
//     User.belongsToMany(models.Subject, { through: models.UserSubject, foreignKey: 'userId', as: 'subjects' });
// };

module.exports = User;