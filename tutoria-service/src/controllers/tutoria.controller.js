const tutoriaService = require('../services/tutoria.service');

exports.crearTutoria = async (req, res, next) => {
  try {
    const docenteId = req.user.id;
    const data = { ...req.body, docenteId };
    const tutoria = await tutoriaService.crearTutoria(data);
    res.status(201).json(tutoria);
  } catch (err) {
    next(err);
  }
};

exports.obtenerTutoriasPorDocente = async (req, res, next) => {
  try {
    const tutorias = await tutoriaService.obtenerTutoriasPorDocente(req.user.id);
    res.json(tutorias);
  } catch (error) {
    next(error);
  }
};

exports.cancelarTutoria = async (req, res, next) => {
  try {
    const { id } = req.params; // id de la tutoría a cancelar
    const tutoriaCancelada = await tutoriaService.cancelarTutoria(id);
    res.json(tutoriaCancelada);
  } catch (error) {
    next(error);
  }
};
