// src/models/postgres/usuario.model.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    rol: {
      type: DataTypes.ENUM('estudiante', 'tutor', 'admin'),
      allowNull: false,
    }
  }, {
    tableName: 'usuarios',
    timestamps: false,
  });

  return Usuario;
};
