const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' }); // Asegúrate de que la ruta al .env es correcta

const sequelize = new Sequelize(process.env.DATABASE_URL , {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;

