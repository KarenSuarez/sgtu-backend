// src/kafka/producers/user-events.producer.js
const kafka = require('../../config/kafka.config');
const producer = kafka.producer();

const TOPIC = 'user-events';

// Conecta el producer inmediatamente al cargar el módulo
(async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka producer conectado');
  } catch (err) {
    console.error('❌ Error conectando Kafka producer:', err);
  }
})();

async function emitUserCreated(user) {
  const payload = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellido: user.apellido,
    codigo: user.codigo,
    rol: user.rol,
    timestamp: Date.now()
  };

  await producer.send({
    topic: TOPIC,
    messages: [
      { key: user.id, value: JSON.stringify({ event: 'USER_CREATED', data: payload }) }
    ]
  });
}

module.exports = {
  emitUserCreated
};
