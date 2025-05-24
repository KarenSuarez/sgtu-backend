const horarioService = require('../services/horario.service');

class HorarioController {
  async crearHorario(req, res, next) {
    try {
      const nuevoHorario = await horarioService.crearHorario(req.body);
      res.status(201).json(nuevoHorario);
    } catch (error) {
      next(error);
    }
  }

  async obtenerHorarios(req, res, next) {
    try {
      const horarios = await horarioService.obtenerHorarios();
      res.json(horarios);
    } catch (error) {
      next(error);
    }
  }

  async obtenerHorarioPorId(req, res, next) {
    try {
      const horario = await horarioService.obtenerHorarioPorId(req.params.id);
      if (!horario) return res.status(404).json({ message: 'Horario no encontrado' });
      res.json(horario);
    } catch (error) {
      next(error);
    }
  }

  async actualizarHorario(req, res, next) {
    try {
      const horarioActualizado = await horarioService.actualizarHorario(req.params.id, req.body);
      res.json(horarioActualizado);
    } catch (error) {
      next(error);
    }
  }

  async eliminarHorario(req, res, next) {
    try {
      await horarioService.eliminarHorario(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HorarioController();
