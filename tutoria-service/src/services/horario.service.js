const HorarioDisponible = require('../models/postgres/horario-disponible.model');

class HorarioService {
  async crearHorario(data) {
    return await HorarioDisponible.create(data);
  }

  async obtenerHorarios() {
    return await HorarioDisponible.findAll();
  }

  async obtenerHorarioPorId(id) {
    return await HorarioDisponible.findByPk(id);
  }

  async actualizarHorario(id, data) {
    const horario = await HorarioDisponible.findByPk(id);
    if (!horario) throw new Error('Horario no encontrado');
    return await horario.update(data);
  }

  async eliminarHorario(id) {
    const horario = await HorarioDisponible.findByPk(id);
    if (!horario) throw new Error('Horario no encontrado');
    return await horario.destroy();
  }
}

module.exports = new HorarioService();
