// src/models/postgres/student.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Student = sequelize.define('Student', {
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
    code: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    program: {
        type: DataTypes.STRING(255),
    },
    semester: {
        type: DataTypes.INTEGER,
    },
}, {
    tableName: 'Students',
    timestamps: false,
    underscored: true,
});

// Student.associate = (models) => {
//     Student.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
// };

module.exports = Student;