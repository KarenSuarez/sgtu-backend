// src/rabbitmq/consumer.js
const amqp = require('amqplib');
const rabbitMQConfig = require('../config/rabbitmq');
const queues = require('./queues');

let connection = null;
let channel = null;
let messageHandlers = {}; // Almacena manejadores por nombre de cola

async function connectConsumer() {
    try {
        if (!connection) {
            connection = await amqp.connect(rabbitMQConfig.url);
            console.log('Consumidor RabbitMQ conectado.');
        }
        if (!channel) {
            channel = await connection.createChannel();
            // Asegurar que la cola existe
            await channel.assertQueue(queues.NOTIFICATION_QUEUE, { durable: true });
            console.log(`Cola '${queues.NOTIFICATION_QUEUE}' asegurada.`);
        }
        return channel;
    } catch (error) {
        console.error('Error al conectar el consumidor RabbitMQ:', error.message);
        channel = null;
        connection = null;
        throw error;
    }
}

async function consumeMessages(queueName, handler) {
    try {
        const currentChannel = channel || await connectConsumer();
        if (!currentChannel) {
            console.error('No se pudo establecer conexión con RabbitMQ para consumir mensajes.');
            return;
        }

        console.log(`[*] Esperando mensajes en ${queueName}. Para salir, presiona CTRL+C`);

        messageHandlers[queueName] = handler; // Guarda el manejador

        currentChannel.consume(queueName, async (msg) => {
            if (msg.content) {
                try {
                    const message = JSON.parse(msg.content.toString());
                    console.log(`[x] Recibido de ${queueName}:`, message);
                    
                    // Llama al manejador específico para esta cola
                    if (messageHandlers[queueName]) {
                        await messageHandlers[queueName](message);
                    }
                    currentChannel.ack(msg); // Confirma el procesamiento del mensaje
                } catch (error) {
                    console.error(`Error procesando mensaje de ${queueName}:`, error.message, msg.content.toString());
                    currentChannel.nack(msg); // Reenvía el mensaje a la cola (opcionalmente con reintento)
                }
            }
        }, {
            noAck: false // Esperamos la confirmación del consumidor
        });
    } catch (error) {
        console.error(`Error al consumir mensajes de la cola ${queueName}:`, error.message);
        // Si hay un error, cerrar la conexión y el canal para forzar reconexión
        if (connection) {
            try { connection.close(); } catch (e) { console.error('Error cerrando conexión RabbitMQ:', e); }
            connection = null;
            channel = null;
        }
    }
}

async function closeConsumer() {
    if (channel) {
        await channel.close();
        channel = null;
    }
    if (connection) {
        await connection.close();
        connection = null;
    }
    console.log('Consumidor RabbitMQ desconectado.');
}

// Escuchar eventos de desconexión
process.on('SIGINT', async () => {
    await closeConsumer();
    process.exit(0);
});

module.exports = {
    connectConsumer,
    consumeMessages,
    closeConsumer
};