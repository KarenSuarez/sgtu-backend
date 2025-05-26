const solicitudService = require('../services/solicitud.service');

exports.crearSolicitud = async (req, res, next) => {
  try {
    const estudianteId = req.user.id;
    const { asignaturaId, mensaje } = req.body;
    const solicitud = await solicitudService.crearSolicitud({ estudianteId, asignaturaId, mensaje });
    res.status(201).json(solicitud);
  } catch (err) {
    next(err);
  }
};

exports.obtenerSolicitudesPorEstudiante = async (req, res, next) => {
  try {
    const solicitudes = await solicitudService.obtenerSolicitudesPorEstudiante(req.user.id);
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
