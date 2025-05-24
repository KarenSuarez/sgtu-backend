const sequelize = require('../../config/postgres.config');

// Importar modelos
const Asignatura = require('./asignatura.model');
const HorarioDisponible = require('./horario-disponible.model');
const SolicitudTutoria = require('./solicitud-tutoria.model');
const Tutoria = require('./tutoria.model');

// Asociaciones

// Asignatura tiene muchas solicitudes
Asignatura.hasMany(SolicitudTutoria, { foreignKey: 'asignaturaId' });
SolicitudTutoria.belongsTo(Asignatura, { foreignKey: 'asignaturaId' });

// Solicitud tiene muchas tutorías
SolicitudTutoria.hasMany(Tutoria, { foreignKey: 'solicitudId' });
Tutoria.belongsTo(SolicitudTutoria, { foreignKey: 'solicitudId' });

// HorarioDisponible no tiene relaciones directas por ahora
// Se podría relacionar con un Docente (UUID), pero como es externo, solo guardamos el ID

module.exports = {
  sequelize,
  Asignatura,
  HorarioDisponible,
  SolicitudTutoria,
  Tutoria,
};
