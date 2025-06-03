// src/models/mongo/system-configuration.model.js
const mongoose = require('mongoose');

const systemConfigurationSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Permite almacenar cualquier tipo de valor de configuración
        required: true,
    },
    description: {
        type: String,
        required: false,
    }
}, {
    timestamps: true,
});

const SystemConfiguration = mongoose.model('SystemConfiguration', systemConfigurationSchema);

module.exports = SystemConfiguration;