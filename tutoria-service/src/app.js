const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// DB connections
const sequelize = require('./config/postgres.config');
const connectMongo = require('./config/mongo.config');

// Importar rutas
const tutoriaRoutes = require('./routes/tutoria.routes');
const solicitudRoutes = require('./routes/solicitud.routes');
const asignaturaRoutes = require('./routes/asignatura.routes');
const horarioRoutes = require('./routes/horario.routes');
const calendarioRoutes = require('./routes/calendario.routes');

// Middlewares
const errorMiddleware = require('./middleware/error.middleware');
const authMiddleware = require('./middleware/auth.middleware');  // <- Importa tu middleware JWT

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Rutas públicas (ejemplo: asignatura, horario y calendario no protegidas)
app.use('/asignatura', asignaturaRoutes);
app.use('/horario', horarioRoutes);
app.use('/calendario', calendarioRoutes);

// Rutas protegidas con autenticación JWT
app.use('/tutoria', authMiddleware, tutoriaRoutes);
app.use('/solicitud', authMiddleware, solicitudRoutes);

// Middleware de error
app.use(errorMiddleware);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('📗 Conectado a PostgreSQL');

    await sequelize.sync({ alter: true });
    console.log('🔄 Tablas sincronizadas con Sequelize');

    await connectMongo();
    console.log('📘 Conectado a MongoDB');

    const PORT = process.env.PORT || 4002;  // Asegúrate de que coincida con tu .env
    app.listen(PORT, () => {
      console.log(`🚀 Tutoria Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
