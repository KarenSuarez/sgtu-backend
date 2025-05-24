const solicitudService = require('../services/solicitud.service');

exports.crearSolicitud = async (req, res, next) => {
  try {
    const solicitud = await solicitudService.crearSolicitud(req.body);
    res.status(201).json(solicitud);
  } catch (error) {
    next(error);
  }
};

exports.obtenerSolicitudesPorEstudiante = async (req, res, next) => {
  try {
    const { estudianteId } = req.params;
    const solicitudes = await solicitudService.obtenerSolicitudesPorEstudiante(estudianteId);
    res.json(solicitudes);
  } catch (error) {
    next(error);
  }
};

exports.actualizarEstadoSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const solicitudActualizada = await solicitudService.actualizarEstadoSolicitud(id, estado);
    res.json(solicitudActualizada);
  } catch (error) {
    next(error);
  }
};
