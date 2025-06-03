require('dotenv').config({path: '.env'});

module.exports = {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queues: require('../rabbitmq/queues') // Importa las colas definidas
};