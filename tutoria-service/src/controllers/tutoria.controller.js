const tutoriaService = require('../services/tutoria.service');

exports.crearTutoria = async (req, res, next) => {
  try {
    const data = req.body; // aquí espera los datos para crear la tutoría
    const nuevaTutoria = await tutoriaService.crearTutoria(data);
    res.status(201).json(nuevaTutoria);
  } catch (error) {
    next(error);
  }
};

exports.obtenerTutoriasPorDocente = async (req, res, next) => {
  try {
    const { docenteId } = req.params;
    const tutorias = await tutoriaService.obtenerTutoriasPorDocente(docenteId);
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
