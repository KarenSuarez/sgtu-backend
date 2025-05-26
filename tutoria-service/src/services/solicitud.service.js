// src/services/solicitud.service.js
const { SolicitudTutoria, Asignatura, Usuario } = require('../models/postgres');

class SolicitudService {
  // Crea la solicitud (data ya incluye estudianteId)
  async crearSolicitud(data) {
    return SolicitudTutoria.create(data);
  }

  // Obtiene las solicitudes de un estudiante, incluyendo asignatura y estudiante
  async obtenerSolicitudesPorEstudiante(estudianteId) {
    return SolicitudTutoria.findAll({
      where: { estudianteId },
      include: [
        {
          model: Asignatura,
          as: 'asignatura',
          attributes: ['id', 'nombre', 'codigo']
        },
        {
          model: Usuario,
          as: 'estudiante',
          attributes: ['id', 'nombre', 'apellido', 'email', 'codigo', 'rol']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // Actualiza solo el estado, devuelve la entidad con relaciones
  async actualizarEstadoSolicitud(id, estado) {
    const solicitud = await SolicitudTutoria.findByPk(id);
    if (!solicitud) throw new Error('Solicitud no encontrada');
    solicitud.estado = estado;
    await solicitud.save();

    // recarga con include
    return SolicitudTutoria.findByPk(id, {
      include: [
        { model: Asignatura, as: 'asignatura' },
        { model: Usuario,    as: 'estudiante' }
      ]
    });
  }
}

module.exports = new SolicitudService();
