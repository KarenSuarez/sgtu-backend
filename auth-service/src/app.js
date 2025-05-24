const express = require('express');
const sequelize = require('./config/database.config');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('../shared/middleware/error.middleware');
const moment = require("moment");
require('dotenv').config();

const app = express();
app.use(express.json());

// Sync DB
sequelize.sync();

// Routes
app.use('/api/auth', authRoutes);

// Global error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;
logMessage = `${moment().format(
      "YYYY-MM-DD HH:mm:ss"
    )} Auth service running on port ${PORT}`;
app.listen(PORT, () => console.log(logMessage));
