// src/models/postgres/role.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'Roles', // Nombre de la tabla en la BD
    timestamps: false, // No necesitamos createdAt y updatedAt para roles
});

module.exports = Role;