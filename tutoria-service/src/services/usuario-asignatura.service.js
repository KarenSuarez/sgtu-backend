const { Usuario, Asignatura } = require('../models/postgres');

class UsuarioAsignaturaService {
  async inscribir(estudianteId, asignaturaId) {
    const usuario = await Usuario.findByPk(estudianteId);
    const asignatura = await Asignatura.findByPk(asignaturaId);
    if (!usuario || !asignatura) throw new Error('Usuario o Asignatura no encontrados');
    await usuario.addAsignatura(asignatura);
    return { message: 'Inscripción exitosa' };
  }

  async listarAsignaturas(estudianteId) {
    const usuario = await Usuario.findByPk(estudianteId, {
      include: [{ model: Asignatura, as: 'asignaturas' }]
    });
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario.asignaturas;
  }
}

module.exports = new UsuarioAsignaturaService();