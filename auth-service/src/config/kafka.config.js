// src/config/kafka.config.js
const { Kafka } = require('kafkajs');
require('dotenv').config();

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: [ process.env.KAFKA_BROKER ]        // p.ej. "localhost:9092"
});

module.exports = kafka;
