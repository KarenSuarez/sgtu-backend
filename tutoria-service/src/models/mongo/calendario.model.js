const mongoose = require('mongoose');

const CalendarioSchema = new mongoose.Schema({
  tutorId: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  horaInicio: {
    type: String,
    required: true,
  },
  horaFin: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada'],
    default: 'pendiente',
  },
  descripcion: {
    type: String,
  }
}, {
  timestamps: true,
  collection: 'calendario',
});

module.exports = mongoose.model('Calendario', CalendarioSchema);
