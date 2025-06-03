// src/services/observers/database-log.observer.js
const NotificationModel = require('../../models/mongo/notification.model'); // Asegúrate de que el nombre del modelo sea correcto

class DatabaseLogObserver {
    async update(notificationData) {
        try {
            const newNotificationLog = new NotificationModel(notificationData);
            await newNotificationLog.save();
            console.log(`Notificación tipo ${notificationData.type} guardada en la base de datos.`);
        } catch (error) {
            console.error(`Error guardando notificación en la base de datos para tipo ${notificationData.type}:`, error.message);
        }
    }
}

module.exports = DatabaseLogObserver;