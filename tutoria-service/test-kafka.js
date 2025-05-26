// test-kafka.js (crear en la raíz del proyecto)
const kafka = require('./src/config/kafka.config');

async function testKafkaConnection() {
  console.log('🧪 === TESTING KAFKA CONNECTION ===');
  
  const admin = kafka.admin();
  
  try {
    console.log('🔍 1. Conectando admin...');
    await admin.connect();
    console.log('✅ 2. Admin conectado');
    
    console.log('🔍 3. Listando topics...');
    const topics = await admin.listTopics();
    console.log('✅ 4. Topics disponibles:', topics);
    
    console.log('🔍 5. Verificando topic user-events...');
    if (topics.includes('user-events')) {
      console.log('✅ Topic user-events existe');
    } else {
      console.log('⚠️  Topic user-events NO existe');
      console.log('🔧 Creando topic...');
      await admin.createTopics({
        topics: [{
          topic: 'user-events',
          numPartitions: 1,
          replicationFactor: 1
        }]
      });
      console.log('✅ Topic user-events creado');
    }
    
    console.log('🔍 6. Obteniendo metadata...');
    const metadata = await admin.fetchTopicMetadata({ topics: ['user-events'] });
    console.log('✅ Metadata:', JSON.stringify(metadata, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing Kafka:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    try {
      await admin.disconnect();
      console.log('✅ Admin desconectado');
    } catch (e) {
      console.error('❌ Error desconectando admin:', e);
    }
  }
}

// Ejecutar test
testKafkaConnection().then(() => {
  console.log('🧪 Test completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test falló:', error);
  process.exit(1);
});
