const Usuario = require('../models/usuario.model');
const bcryptService = require('../services/bcrypt.service');
const jwtService = require('../services/jwt.service');
const { emitUserCreated } = require('../kafka/producers/user-events.producer');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const valid = await bcryptService.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwtService.generateToken({ 
      id: user.id, 
      email: user.email, 
      rol: user.rol // También puedes incluir el rol en el token si lo necesitas
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  console.log('🔔 Registro recibido:', req.body);
  try {
    const { email, password, nombre, apellido, codigo, rol } = req.body;
    if (!email || !password || !nombre || !apellido || !codigo || !rol) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const hashedPassword = await bcryptService.hashPassword(password);
    const usuario = await Usuario.create({
      email, password: hashedPassword, nombre, apellido, codigo, rol
    });
    console.log('✅ Usuario creado:', usuario.id);

    try {
      await emitUserCreated(usuario);  // producer ya conectado en arranque
      console.log('✅ Evento USER_CREATED enviado');
    } catch (kErr) {
      console.error('❌ Error enviando evento Kafka:', kErr);
      // no interrumpimos el flujo HTTP, pero lo logeamos
    }

    const { id, createdAt } = usuario;
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: { id, email, nombre, apellido, codigo, rol, createdAt }
    });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
};