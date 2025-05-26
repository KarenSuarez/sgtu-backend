// src/services/tutoria.service.js
const { Tutoria, SolicitudTutoria, Usuario } = require('../models/postgres');

class TutoriaService {
  // Crea la tutoría (data incluye solicitudId + docenteId)
  async crearTutoria(data) {
    return Tutoria.create(data);
  }

  // Lista tutorías de un docente con detalles de solicitud y estudiante
  async obtenerTutoriasPorDocente(docenteId) {
    return Tutoria.findAll({
      where: { docenteId },
      include: [
        {
          model: SolicitudTutoria,
          as: 'solicitud',
          include: [
            { model: Usuario, as: 'estudiante', attributes: ['id','nombre','email'] },
            { model: Asignatura, as: 'asignatura', attributes: ['id','nombre','codigo'] }
          ]
        }
      ],
      order: [['fecha', 'ASC'], ['horaInicio', 'ASC']]
    });
  }

  // Cancela y devuelve la tutoría con sus relaciones
  async cancelarTutoria(id) {
    const tutoria = await Tutoria.findByPk(id);
    if (!tutoria) throw new Error('Tutoria no encontrada');
    tutoria.estado = 'cancelada';
    await tutoria.save();

    return Tutoria.findByPk(id, {
      include: [
        {
          model: SolicitudTutoria,
          as: 'solicitud',
          include: [{ model: Usuario, as: 'estudiante' }]
        },
        { model: Usuario, as: 'docente' }
      ]
    });
  }
}

module.exports = new TutoriaService();
