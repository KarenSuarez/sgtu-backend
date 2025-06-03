// src/models/mongo/notification.model.js
const mongoose = require('mongoose');
const NotificationType = require('../../enums/notification-type.enum');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: Object.values(NotificationType),
        required: true,
    },
    recipientId: { // ID del usuario (PostgreSQL) a quien va dirigida la notificación
        type: Number,
        required: true,
    },
    recipientEmail: { // Email del destinatario para envío directo
        type: String,
        required: true,
    },
    message: { // Contenido principal de la notificación
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    read: { // Si el usuario la ha leído (para notificaciones en el sistema)
        type: Boolean,
        default: false,
    },
    metadata: { // Datos adicionales relacionados con la notificación (ej. tutoringId, requestId)
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true, // createdAt y updatedAt
});

notificationSchema.index({ recipientId: 1, read: 1, creationDate: -1 });
notificationSchema.index({ type: 1, creationDate: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;