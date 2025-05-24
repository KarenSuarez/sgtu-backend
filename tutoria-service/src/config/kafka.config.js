// src/config/kafka.config.js
const { Kafka } = require('kafkajs');
require('dotenv').config();

module.exports = new Kafka({
  clientId: 'tutoria-service',
  brokers: [process.env.KAFKA_BROKER]
});
