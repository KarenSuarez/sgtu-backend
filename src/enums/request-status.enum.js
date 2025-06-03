// src/enums/request-status.enum.js
const RequestStatus = {
    PENDING: 'PENDING', // Pendiente de aprobación del docente
    APPROVED: 'APPROVED', // Aprobada por el docente
    REJECTED: 'REJECTED', // Rechazada por el docente
    CANCELLED: 'CANCELLED', // Cancelada por el estudiante antes de ser aprobada
};

module.exports = RequestStatus;