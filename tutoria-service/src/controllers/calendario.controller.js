const calendarioService = require('../services/calendario.service');

class CalendarioController {
  async crearEvento(req, res, next) {
    try {
      const evento = await calendarioService.crearEvento(req.body);
      res.status(201).json(evento);
    } catch (error) {
      next(error);
    }
  }

  async obtenerEventosPorTutor(req, res, next) {
    try {
      const tutorId = req.params.tutorId;
      const eventos = await calendarioService.obtenerEventosPorTutor(tutorId);
      res.json(eventos);
    } catch (error) {
      next(error);
    }
  }

  async actualizarEstadoEvento(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const eventoActualizado = await calendarioService.actualizarEstadoEvento(id, estado);
      res.json(eventoActualizado);
    } catch (error) {
      next(error);
    }
  }

  async eliminarEvento(req, res, next) {
    try {
      const { id } = req.params;
      await calendarioService.eliminarEvento(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalendarioController();
