// src/services/notification-manager.js
const Notification = require('../models/mongo/notification.model'); // Para guardar en DB si es necesario
const queues = require('../rabbitmq/queues');
const { sendMessage } = require('../rabbitmq/producer');

class NotificationManager {
    constructor() {
        if (NotificationManager.instance) {
            return NotificationManager.instance;
        }
        this.observers = []; // Lista de observadores
        NotificationManager.instance = this;
    }

    // Método para obtener la única instancia del Singleton
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    // Suscribir un observador
    addObserver(observer) {
        this.observers.push(observer);
        console.log(`Observador ${observer.constructor.name} añadido.`);
    }

    // Desuscribir un observador
    removeObserver(observerToRemove) {
        this.observers = this.observers.filter(observer => observer !== observerToRemove);
        console.log(`Observador ${observerToRemove.constructor.name} eliminado.`);
    }

    /**
     * Notifica a todos los observadores y también envía el mensaje a RabbitMQ.
     * @param {NotificationType} type - Tipo de notificación.
     * @param {number} recipientId - ID del destinatario (user_id de PostgreSQL).
     * @param {string} recipientEmail - Email del destinatario.
     * @param {string} messageContent - Contenido principal del mensaje.
     * @param {object} metadata - Metadatos adicionales (ej. datos de la tutoría).
     */
    async notify(type, recipientId, recipientEmail, messageContent, metadata = {}) {
        const notificationData = {
            type,
            recipientId,
            recipientEmail,
            message: messageContent,
            metadata,
        };

        // 1. Notificar a los observadores (ej. para guardar en DB, enviar email directo si no es por cola)
        for (const observer of this.observers) {
            try {
                await observer.update(notificationData);
            } catch (error) {
                console.error(`Error notificando al observador ${observer.constructor.name}:`, error.message);
            }
        }

        // 2. Enviar el mensaje a RabbitMQ para procesamiento asíncrono
        try {
            await sendMessage(queues.NOTIFICATION_QUEUE, notificationData);
            console.log(`Notificación [${type}] para ${recipientEmail} enviada a RabbitMQ.`);
        } catch (error) {
            console.error(`Error enviando notificación a RabbitMQ para ${recipientEmail}:`, error.message);
            // Podrías implementar una lógica de fallback aquí, ej. guardar en BD para reintentar
        }
    }
}

module.exports = NotificationManager;