// test-kafka-consumer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kafka-test-client',
  brokers: ['localhost:9092'], // asegúrate de que el puerto sea correcto
});

const consumer = kafka.consumer({ groupId: 'kafka-test-group' });

async function run() {
  try {
    console.log('🟡 Conectando consumidor de prueba...');
    await consumer.connect();
    console.log('✅ Conectado a Kafka');

    await consumer.subscribe({ topic: 'user-events', fromBeginning: true });
    console.log('📡 Suscrito al topic: user-events');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('📥 Mensaje recibido:', message.value.toString());
      },
    });
  } catch (err) {
    console.error('❌ Error en el consumidor de prueba:', err.message);
  }
}

run();
