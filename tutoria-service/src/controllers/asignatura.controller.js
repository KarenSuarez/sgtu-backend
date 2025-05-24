const asignaturaService = require('../services/asignatura.service');

class AsignaturaController {
  async getAll(req, res, next) {
    try {
      const asignaturas = await asignaturaService.getAll();
      res.json(asignaturas);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const asignatura = await asignaturaService.getById(req.params.id);
      if (!asignatura) return res.status(404).json({ message: 'Asignatura no encontrada' });
      res.json(asignatura);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const asignatura = await asignaturaService.create(req.body);
      res.status(201).json(asignatura);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const asignatura = await asignaturaService.update(req.params.id, req.body);
      res.json(asignatura);
    } catch (error) {
      if (error.message === 'Asignatura no encontrada') return res.status(404).json({ message: error.message });
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await asignaturaService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Asignatura no encontrada') return res.status(404).json({ message: error.message });
      next(error);
    }
  }
}

module.exports = new AsignaturaController();
