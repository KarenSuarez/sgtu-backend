// src/rabbitmq/producer.js
const amqp = require('amqplib');
const rabbitMQConfig = require('../config/rabbitmq');
const queues = require('./queues');

let connection = null;
let channel = null;

async function connectProducer() {
    try {
        if (!connection) {
            connection = await amqp.connect(rabbitMQConfig.url);
            console.log('Productor RabbitMQ conectado.');
        }
        if (!channel) {
            channel = await connection.createChannel();
            // Asegurar que la cola existe
            await channel.assertQueue(queues.NOTIFICATION_QUEUE, { durable: true });
            console.log(`Cola '${queues.NOTIFICATION_QUEUE}' asegurada.`);
        }
        return channel;
    } catch (error) {
        console.error('Error al conectar el productor RabbitMQ:', error.message);
        // Si la conexión falla, asegúrate de que 'channel' sea null para reintentar
        channel = null; 
        connection = null;
        throw error; // Relanza para que el servicio lo maneje
    }
}

async function sendMessage(queueName, message) {
    try {
        const currentChannel = channel || await connectProducer(); // Reintenta conectar si no hay canal
        if (!currentChannel) {
            console.error('No se pudo establecer conexión con RabbitMQ para enviar mensaje.');
            return false;
        }
        currentChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        // console.log(`Mensaje enviado a la cola ${queueName}:`, message);
        return true;
    } catch (error) {
        console.error(`Error al enviar mensaje a la cola ${queueName}:`, error.message);
        // Desconectar para forzar una reconexión en el siguiente intento
        if (connection) {
            try { connection.close(); } catch (e) { console.error('Error cerrando conexión RabbitMQ:', e); }
            connection = null;
            channel = null;
        }
        return false;
    }
}

async function closeProducer() {
    if (channel) {
        await channel.close();
        channel = null;
    }
    if (connection) {
        await connection.close();
        connection = null;
    }
    console.log('Productor RabbitMQ desconectado.');
}

// Escuchar eventos de desconexión para intentar reconectar si RabbitMQ se cae
process.on('SIGINT', async () => {
    await closeProducer();
    process.exit(0);
});

module.exports = {
    connectProducer,
    sendMessage,
    closeProducer
};