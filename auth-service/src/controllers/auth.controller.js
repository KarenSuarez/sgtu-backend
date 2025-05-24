const Usuario = require('../models/usuario.model');
const bcryptService = require('../services/bcrypt.service');
const jwtService = require('../services/jwt.service');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const valid = await bcryptService.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = jwtService.generateToken({ id: user.id, email: user.email });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, nombre } = req.body;

    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) return res.status(409).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcryptService.hashPassword(password);

    const newUser = await Usuario.create({ email, password: hashedPassword, nombre });

    const token = jwtService.generateToken({ id: newUser.id, email: newUser.email });
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

