// src/routes/schedule.routes.js
const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const validate = require('../middleware/validation.middleware');
const authenticateToken = require('../middleware/auth.middleware');
const {
    createClassScheduleSchema,
    updateClassScheduleSchema,
    createAvailabilityScheduleSchema, // <-- Importar el nuevo esquema
    updateAvailabilityScheduleSchema  // <-- Importar el nuevo esquema
} = require('../validators/schedule.validator');

const router = express.Router();

// --- Rutas de Horarios de Clase (ClassSchedule) ---
router.post('/class', authenticateToken, validate(createClassScheduleSchema), scheduleController.createClassSchedule);
router.get('/class', authenticateToken, scheduleController.getAllClassSchedules);
router.get('/class/:id', authenticateToken, scheduleController.getClassScheduleById);
router.put('/class/:id', authenticateToken, validate(updateClassScheduleSchema), scheduleController.updateClassSchedule);
router.delete('/class/:id', authenticateToken, scheduleController.deleteClassSchedule);
router.get('/class/user/:userId', authenticateToken, scheduleController.getClassSchedulesForUser);

// --- Rutas de Horarios de Disponibilidad (AvailableSchedule) ---
router.post('/availability', authenticateToken, validate(createAvailabilityScheduleSchema), scheduleController.createAvailabilitySchedule);
router.get('/availability', authenticateToken, scheduleController.getAllAvailabilitySchedules);
router.get('/availability/:id', authenticateToken, scheduleController.getAvailabilityScheduleById);
router.put('/availability/:id', authenticateToken, validate(updateAvailabilityScheduleSchema), scheduleController.updateAvailabilitySchedule);
router.delete('/availability/:id', authenticateToken, scheduleController.deleteAvailabilitySchedule);
router.get('/availability/teacher/:teacherId', authenticateToken, scheduleController.getAvailabilitySchedulesForTeacher);

module.exports = router;