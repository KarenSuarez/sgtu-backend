const { DataTypes } = require('sequelize');
const sequelize = require('../../config/postgres.config');

const Asignatura = sequelize.define('Asignatura', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  codigo: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'asignaturas',
  timestamps: true,
});

module.exports = Asignatura;
