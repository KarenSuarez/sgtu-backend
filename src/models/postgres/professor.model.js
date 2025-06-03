// src/models/postgres/professor.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Professor = sequelize.define('Professor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
        // Referencia y onDelete se definirá en app.js para evitar circularidad
    },
    teacherCode: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'teacher_code',
    },
    area: {
        type: DataTypes.STRING(255),
    },
}, {
    tableName: 'Professors',
    timestamps: false,
    underscored: true,
});

// Professor.associate = (models) => {
//     Professor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
// };

module.exports = Professor;