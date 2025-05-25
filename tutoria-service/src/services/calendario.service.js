const Calendario = require('../models/mongo/calendario.model');

class CalendarioService {
  async crearEvento(data) {
    const evento = new Calendario(data);
    return await evento.save();
  }

  async obtenerEventosPorTutor(tutorId) {
    return await Calendario.find({ tutorId });
  }

  async actualizarEstadoEvento(id, estado) {
    return await Calendario.findByIdAndUpdate(id, { estado }, { new: true });
  }

  async eliminarEvento(id) {
    return await Calendario.findByIdAndDelete(id);
  }
}

module.exports = new CalendarioService();

