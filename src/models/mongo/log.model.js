// src/models/mongo/log.model.js
const mongoose = require('mongoose');
const ActionType = require('../../enums/action-type.enum');

const logSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    userId: { // ID del usuario que realizó la acción (viene de PostgreSQL)
        type: Number,
        required: false, // Puede ser null si la acción no está asociada a un usuario (ej. error de sistema, inicio de server)
    },
    userEmail: { // Email del usuario para facilitar la auditoría sin hacer joins a PostgreSQL
        type: String,
        required: false
    },
    action: { // Tipo de acción realizada
        type: String,
        enum: Object.values(ActionType), // Valida el tipo de acción con el enum
        required: true
    },
    details: { // Objeto flexible para almacenar detalles específicos de la acción (ej. {oldStatus: 'PENDING', newStatus: 'APPROVED'})
        type: mongoose.Schema.Types.Mixed // Permite almacenar cualquier tipo de dato
    },
    ipAddress: { // Dirección IP desde la que se realizó la acción
        type: String
    },
    userAgent: { // User-Agent del cliente
        type: String
    },
    // Podrías añadir un campo para 'resourceId' si quieres rastrear el ID del recurso afectado
    // resourceId: {
    //     type: String, // String para ser flexible con IDs de PostgreSQL/MongoDB
    //     required: false
    // },
    // resourceType: {
    //     type: String, // Ej. 'User', 'TutoringRequest', 'Subject'
    //     required: false
    // }
}, {
    timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Índices para consultas rápidas
logSchema.index({ timestamp: -1 }); // Índice descendente por fecha para consultas recientes
logSchema.index({ userId: 1, action: 1 }); // Índice compuesto para búsquedas por usuario y acción
logSchema.index({ action: 1 }); // Índice para búsquedas por tipo de acción
// logSchema.index({ resourceId: 1, resourceType: 1 }); // Si se añaden estos campos

const LogEntry = mongoose.model('LogEntry', logSchema);

module.exports = LogEntry;