// src/services/observers/rabbitmq-notification.observer.js
// En este diseño, NotificationManager ya envía el mensaje a RabbitMQ directamente.
// Este observador es más conceptual o para futuras expansiones
// donde un observador específico podría manejar el enrutamiento más complejo de mensajes RabbitMQ.

class RabbitMQNotificationObserver {
    async update(notificationData) {
        // En este caso, el NotificationManager ya se encarga de enviar a RabbitMQ.
        // Este observador podría ser útil si el mensaje necesitara ser transformado
        // o enrutado a una cola diferente basada en lógica de negocio compleja.
        console.log(`[RabbitMQ Observer] Procesando notificación tipo ${notificationData.type} para RabbitMQ (ya enviada por NotificationManager).`);
        // No hay necesidad de reenviar a RabbitMQ aquí, ya lo hizo el manager.
    }
}

module.exports = RabbitMQNotificationObserver;