const TutoringStatus = {
    SCHEDULED: 'SCHEDULED', // Programada, pendiente de realizar
    IN_PROGRESS: 'IN_PROGRESS', // En curso
    COMPLETED: 'COMPLETED', // Realizada
    CANCELLED: 'CANCELLED', // Cancelada por estudiante o docente
    NO_SHOW: 'NO_SHOW', // Estudiante no se presentó
};

module.exports = TutoringStatus;