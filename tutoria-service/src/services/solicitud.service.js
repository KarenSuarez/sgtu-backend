const { SolicitudTutoria } = require('../models/postgres');

class SolicitudService {
  async crearSolicitud(data) {
    return SolicitudTutoria.create(data);
  }

  async obtenerSolicitudesPorEstudiante(estudianteId) {
    return SolicitudTutoria.findAll({ where: { estudianteId } });
  }

  async actualizarEstadoSolicitud(id, estado) {
    const solicitud = await SolicitudTutoria.findByPk(id);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    solicitud.estado = estado;
    return solicitud.save();
  }
}

module.exports = new SolicitudService();
