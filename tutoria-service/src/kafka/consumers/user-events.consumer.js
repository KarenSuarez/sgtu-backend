// src/kafka/consumers/user-events.consumer.js
const kafka = require('../../config/kafka.config');
const consumer = kafka.consumer({ groupId: 'tutoria-service-group' });
const { Usuario } = require('../models/postgres'); 
// asume que tu index.js en models/postgres exporta todos los modelos, incluido Usuario

const TOPIC = 'user-events';

async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { event, data } = JSON.parse(message.value.toString());
      console.log(`📥 [Tutoria consumer] Evento ${event}`, data);

      if (event === 'USER_CREATED') {
        // Upsert: crea o actualiza el usuario en tu BD de tutoria
        await Usuario.upsert({
          id: data.id,
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          codigo: data.codigo,
          rol: data.rol
        });
      }
    }
  });

  console.log('✅ Tutoria-service Kafka consumer conectado');
}

module.exports = { connectConsumer };
