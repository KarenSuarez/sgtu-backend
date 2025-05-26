const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('UsuarioAsignatura', {}, {
    tableName: 'usuario_asignaturas',
    timestamps: false,
  });
};