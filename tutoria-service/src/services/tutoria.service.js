const { Tutoria } = require('../models/postgres');

class TutoriaService {
  async crearTutoria(data) {
    // data debería contener: docenteId, asignaturaId, fechaHora, duracion, etc.
    const nuevaTutoria = await Tutoria.create(data);
    return nuevaTutoria;
  }

  async obtenerTutoriasPorDocente(docenteId) {
    return await Tutoria.findAll({ where: { docenteId } });
  }

  async cancelarTutoria(tutoriaId) {
    const tutoria = await Tutoria.findByPk(tutoriaId);
    if (!tutoria) throw new Error('Tutoria no encontrada');

    tutoria.estado = 'cancelada';
    await tutoria.save();

    return tutoria;
  }
}

module.exports = new TutoriaService();
