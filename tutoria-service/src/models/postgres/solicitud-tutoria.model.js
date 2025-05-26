const { DataTypes } = require('sequelize');
const sequelize = require('../../config/postgres.config');

const SolicitudTutoria = sequelize.define('SolicitudTutoria', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  estudianteId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'usuarios', key: 'id' }
  },
  asignaturaId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'asignaturas', key: 'id' }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aceptada', 'rechazada', 'cancelada'),
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'solicitudes_tutoria',
  timestamps: true,
});

module.exports = SolicitudTutoria;