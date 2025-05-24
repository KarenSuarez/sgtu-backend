const sequelize = require('./config/database.config');
const Usuario = require('./models/usuario.model');
const { hashPassword } = require('./services/bcrypt.service');

async function seed() {
  await sequelize.sync({ force: true }); // ⚠️ Esto borra y recrea todas las tablas

  const email = 'admin@demo.com';
  const password = 'admin123';
  const nombre = 'Admin'; // ✅ Añadido campo obligatorio

  const hashed = await hashPassword(password);

  const [user, created] = await Usuario.findOrCreate({
    where: { email },
    defaults: {
      password: hashed,
      nombre, // ✅ Se agrega el nombre
    },
  });

  console.log(created ? 'Usuario creado ✅' : 'Usuario ya existía ℹ️');
  process.exit();
}

seed();

