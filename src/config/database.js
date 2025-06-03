// src/config/database.js
require('dotenv').config({path: ".env"}); // Cargar variables de entorno desde .env

const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

// Configuración de PostgreSQL con Sequelize
const sequelize = new Sequelize(
    process.env.DB_PG_DATABASE,
    process.env.DB_PG_USER,
    process.env.DB_PG_PASSWORD,
    {
        host: process.env.DB_PG_HOST,
        port: process.env.DB_PG_PORT,
        dialect: 'postgres',
        logging: false, // Desactiva el log de SQL en la consola (puedes activarlo para depurar)
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: process.env.DB_PG_SSL === 'true' ? {
                require: true,
                rejectUnauthorized: false // Para entornos de desarrollo, en producción debería ser true
            } : false
        }
    }
);

async function connectPostgreSQL() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a PostgreSQL (Sequelize) establecida exitosamente.');
    } catch (error) {
        console.error('Error al conectar a PostgreSQL (Sequelize):', error);
        process.exit(1); // Terminar el proceso si falla la conexión inicial
    }
}

// Configuración de MongoDB con Mongoose (sin cambios)
const mongoURI = process.env.DB_MONGO_URI;

async function connectMongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Conectado a MongoDB (Mongoose) exitosamente.');
    } catch (err) {
        console.error('Error al conectar a MongoDB (Mongoose):', err);
        process.exit(1); // Terminar el proceso si falla la conexión inicial
    }
}

function getMongoDBClient() {
    return mongoose;
}

module.exports = {
    sequelize, // Exporta la instancia de Sequelize
    connectPostgreSQL,
    connectMongoDB,
    getMongoDBClient
};