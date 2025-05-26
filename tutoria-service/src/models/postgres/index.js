// src/models/postgres/index.js
const sequelize          = require('../../config/postgres.config');

// FACTORIES (hay que pasarles sequelize):
const Usuario            = require('./usuario.model')(sequelize);
const UsuarioAsignatura  = require('./usuario-asignatura.model')(sequelize);

// ESTÁTICOS (ya llaman a define internamente):
const Asignatura         = require('./asignatura.model');
const SolicitudTutoria   = require('./solicitud-tutoria.model');
const Tutoria            = require('./tutoria.model');
const HorarioDisponible  = require('./horario-disponible.model');

/** Relaciones **/

// Usuario ↔ SolicitudTutoria
Usuario.hasMany(SolicitudTutoria, { foreignKey: 'estudianteId', as: 'solicitudes' });
SolicitudTutoria.belongsTo(Usuario,   { foreignKey: 'estudianteId', as: 'estudiante' });

// Asignatura ↔ SolicitudTutoria
Asignatura.hasMany(SolicitudTutoria,  { foreignKey: 'asignaturaId', as: 'solicitudes' });
SolicitudTutoria.belongsTo(Asignatura,{ foreignKey: 'asignaturaId', as: 'asignatura' });

// SolicitudTutoria ↔ Tutoria
SolicitudTutoria.hasMany(Tutoria,     { foreignKey: 'solicitudId', as: 'tutorias' });
Tutoria.belongsTo(SolicitudTutoria,   { foreignKey: 'solicitudId', as: 'solicitud' });

// Usuario (docente) ↔ Tutoria
Usuario.hasMany(Tutoria,   { foreignKey: 'docenteId', as: 'tutoriasDictadas' });
Tutoria.belongsTo(Usuario, { foreignKey: 'docenteId', as: 'docente' });

// Usuario ↔ Asignatura (many-to-many)
Usuario.belongsToMany(Asignatura, { through: UsuarioAsignatura, as: 'asignaturas' });
Asignatura.belongsToMany(Usuario, { through: UsuarioAsignatura, as: 'estudiantes' });

module.exports = {
  sequelize,
  Usuario,
  Asignatura,
  HorarioDisponible,
  SolicitudTutoria,
  Tutoria,
  UsuarioAsignatura,
};
