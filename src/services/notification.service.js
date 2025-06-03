// src/services/notification.service.js
const NotificationManager = require('./notification-manager');
const NotificationType = require('../enums/notification-type.enum');
const queues = require('../rabbitmq/queues');
const { consumeMessages } = require('../rabbitmq/consumer');

// Importar modelos para obtener datos del destinatario
const UserModel = require('../models/postgres/user.model');
const StudentModel = require('../models/postgres/student.model');
const ProfessorModel = require('../models/postgres/professor.model');

class NotificationService {
    constructor() {
        this.notificationManager = NotificationManager.getInstance();
        this._setupConsumers(); // Iniciar consumidores de RabbitMQ al instanciar el servicio
    }

    /**
     * Inicia los consumidores de RabbitMQ para procesar mensajes de notificación.
     * Esto debería llamarse una vez al iniciar la aplicación.
     */
    async _setupConsumers() {
        await consumeMessages(queues.NOTIFICATION_QUEUE, this.processNotificationMessage.bind(this));
    }

    /**
     * Procesa un mensaje de notificación recibido de RabbitMQ.
     * Este es el "manejador" que consume los mensajes de la cola.
     * @param {object} message - El objeto de mensaje recibido de la cola de RabbitMQ.
     */
    async processNotificationMessage(message) {
        console.log(`[Consumer] Procesando mensaje de notificación: ${message.type}`);
        
        const EmailNotificationObserver = require('./observers/email-notification.observer');
        const emailObserverInstance = new EmailNotificationObserver(); 
        
        // La validación de recipientEmail se hará dentro del observador
        await emailObserverInstance.update(message); // Aquí 'message' ya es el objeto completo de notificación
    }

    /**
     * Envía una notificación genérica.
     * @param {string} type - Tipo de notificación (del enum NotificationType).
     * @param {number} recipientUserId - ID del usuario de PostgreSQL destinatario.
     * @param {string} messageContent - Contenido principal del mensaje.
     * @param {object} metadata - Metadatos adicionales.
     */
    async sendNotification(type, recipientUserId, messageContent, metadata = {}) {
        const user = await UserModel.findByPk(recipientUserId, { attributes: ['email'] });
        if (!user || !user.email) {
            console.error(`No se pudo encontrar el email para el usuario ID ${recipientUserId}. No se enviará notificación.`);
            return;
        }
        // El NotificationManager enviará a los observadores Y a RabbitMQ
        await this.notificationManager.notify(type, recipientUserId, user.email, messageContent, metadata);
    }
}

module.exports = NotificationService;