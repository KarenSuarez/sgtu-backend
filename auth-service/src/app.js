const express = require('express');
require('dotenv').config({path: '../.env'});

const sequelize = require('./config/database.config');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('../shared/middleware/error.middleware');

require('./models/usuario.model');

const app = express();
app.use(express.json());

const { connectConsumer } = require('./kafka/consumers/user-events.consumer');
const PORT = process.env.PORT || 3001;

(async () => {
  try {
    console.log('Verificando conexión a la base de datos...');
    await sequelize.authenticate(); // Paso explícito
    console.log('Conexión establecida correctamente.');

    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada.');

    app.use('/api/auth', authRoutes);
    app.use(errorMiddleware);

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error durante el arranque:', err.message);
    process.exit(1); // salir si hay un fallo crítico
  }
})();
