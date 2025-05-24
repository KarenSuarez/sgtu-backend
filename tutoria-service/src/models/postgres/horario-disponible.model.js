const { DataTypes } = require('sequelize');
const sequelize = require('../../config/postgres.config');

const HorarioDisponible = sequelize.define('HorarioDisponible', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  docenteId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  dia: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
}, {
  tableName: 'horarios_disponibles',
  timestamps: true,
});

module.exports = HorarioDisponible;
