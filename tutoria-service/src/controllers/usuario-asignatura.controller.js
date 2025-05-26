const service = require('../services/usuario-asignatura.service');

exports.inscribir = async (req, res, next) => {
  try {
    const estudianteId = req.user.id;
    const { asignaturaId } = req.body;
    const result = await service.inscribir(estudianteId, asignaturaId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const estudianteId = req.user.id;
    const asignaturas = await service.listarAsignaturas(estudianteId);
    res.json(asignaturas);
  } catch (err) {
    next(err);
  }
};