const express = require('express');
require('dotenv').config();

const postgres = require('./config/postgres.config');
const mongo = require('./config/mongo.config');

// Importar rutas y middleware
const authMiddleware = require('./middleware/auth.middleware');
const errorMiddleware = require('./middleware/error.middleware');
const asignaturaRoutes = require('./routes/asignatura.routes');
const calendarioRoutes = require('./routes/calendario.routes');
const horarioRoutes = require('./routes/horario.routes');
const solicitudRoutes = require('./routes/solicitud.routes');
const tutoriaRoutes = require('./routes/tutoria.routes');

// Consumidor Kafka
const { connectConsumer } = require('./kafka/consumers/user-events.consumer');

const app = express();
app.use(express.json());
app.use('/api/usuario-asignaturas', require('./routes/usuario-asignatura.routes'));
(async () => {
  try {
    // Conectar bases de datos
    // Conectar bases de datos PRIMERO
    await postgres.authenticate();
    await postgres.sync({ alter: true });
    await mongo.connect();
    console.log('✅ Bases de datos conectadas');

    // Conectar consumidor Kafka
    await connectConsumer();
    // Rutas públicas
    app.use('/api/calendario', calendarioRoutes);

    // Middleware JWT
    app.use(authMiddleware);

    // Rutas protegidas
    app.use('/api/asignaturas', asignaturaRoutes);
    app.use('/api/horario', horarioRoutes);
    app.use('/api/solicitud', solicitudRoutes);
    app.use('/api/tutorias', tutoriaRoutes);

    // Middleware de errores
    app.use(errorMiddleware);

    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => console.log(`🚀 Tutoria-service corriendo en el puerto ${PORT}`));
  } catch (err) {
    console.error('❌ Error al iniciar la app:', err.message);
    process.exit(1);
  }
})();
