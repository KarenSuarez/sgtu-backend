// src/enums/notification-type.enum.js
const NotificationType = {
    REMINDER: 'REMINDER', // Recordatorio de tutoría
    CONFIRMATION: 'CONFIRMATION', // Confirmación de tutoría agendada
    CANCELLATION: 'CANCELLATION', // Cancelación de tutoría/solicitud
    SCHEDULE_CHANGE: 'SCHEDULE_CHANGE', // Cambio de horario de tutoría (futuro)
    SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT', // Advertencia de conflicto de horario (futuro)
    PENDING_REQUEST: 'PENDING_REQUEST', // Notificación a docente sobre nueva solicitud
    REQUEST_APPROVED: 'REQUEST_APPROVED', // Notificación a estudiante de solicitud aprobada
    REQUEST_REJECTED: 'REQUEST_REJECTED', // Notificación a estudiante de solicitud rechazada
};

module.exports = NotificationType;