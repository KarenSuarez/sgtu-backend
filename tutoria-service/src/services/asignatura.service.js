const Asignatura = require('../models/postgres/asignatura.model');

class AsignaturaService {
  async getAll() {
    return await Asignatura.findAll();
  }

  async getById(id) {
    return await Asignatura.findByPk(id);
  }

  async create(data) {
    return await Asignatura.create(data);
  }

  async update(id, data) {
    const asignatura = await Asignatura.findByPk(id);
    if (!asignatura) throw new Error('Asignatura no encontrada');
    return await asignatura.update(data);
  }

  async delete(id) {
    const asignatura = await Asignatura.findByPk(id);
    if (!asignatura) throw new Error('Asignatura no encontrada');
    return await asignatura.destroy();
  }
}

module.exports = new AsignaturaService();
