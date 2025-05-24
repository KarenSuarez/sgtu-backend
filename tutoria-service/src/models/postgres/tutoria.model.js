const { DataTypes } = require('sequelize');
const sequelize = require('../../config/postgres.config');

const Tutoria = sequelize.define('Tutoria', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  solicitudId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  docenteId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
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
  estado: {
    type: DataTypes.ENUM('programada', 'completada', 'cancelada'),
    defaultValue: 'programada',
  },
}, {
  tableName: 'tutorias',
  timestamps: true,
});

module.exports = Tutoria;
