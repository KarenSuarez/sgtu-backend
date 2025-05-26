// src/kafka/consumers/user-events.consumer.js
const { kafka } = require('../../config/kafka.config'); // ✅ debe importar { kafka }
const db = require('../../models/postgres');

const consumer = kafka.consumer({ groupId: 'tutoria-service-group' });

const connectConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-events', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const parsed = JSON.parse(message.value.toString());
      console.log('📥 [user-events] Mensaje recibido:', parsed);

      const { event, data } = parsed;

      if (event === 'USER_CREATED') {
        const { id, nombre, apellido, email, codigo, rol } = data;

        try {
          const [user, created] = await db.Usuario.findOrCreate({
            where: { id },
            defaults: { nombre, apellido, email, codigo, rol }
          });

          if (created) {
            console.log(`✅ Usuario creado en tutoria-service: ${email}`);
          } else {
            console.log(`ℹ️ Usuario ya existía: ${email}`);
          }
        } catch (error) {
          console.error('❌ Error al guardar usuario:', error);
        }
      }
    },
  });
};

module.exports = { connectConsumer };
