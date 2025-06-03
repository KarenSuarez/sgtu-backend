// src/routes/subject.routes.js
const express = require('express');
const subjectController = require('../controllers/subject.controller');
const validate = require('../middleware/validation.middleware');
const authenticateToken = require('../middleware/auth.middleware');
const { createSubjectSchema, updateSubjectSchema, userSubjectSchema } = require('../validators/subject.validator');
// const authorizeRoles = require('../middleware/role.middleware'); // Lo usaremos más adelante

const router = express.Router();

// Rutas protegidas (requieren autenticación)
router.post('/', authenticateToken, validate(createSubjectSchema), subjectController.createSubject);
router.get('/', authenticateToken, subjectController.getAllSubjects);
router.get('/:id/teachers', authenticateToken, subjectController.getTeachersBySubject);
router.get('/:id', authenticateToken, subjectController.getSubjectById);
router.put('/:id', authenticateToken, validate(updateSubjectSchema), subjectController.updateSubject);
router.delete('/:id', authenticateToken, subjectController.deleteSubject);

// Rutas para asociar/desasociar usuarios a asignaturas (ej. un profesor enseña una asignatura, un estudiante cursa)
router.post('/associate-user', authenticateToken, validate(userSubjectSchema), subjectController.addUserToSubject);
router.delete('/dissociate-user', authenticateToken, validate(userSubjectSchema), subjectController.removeUserFromSubject);
router.get('/user/:userId', authenticateToken, subjectController.getSubjectsForUser); // Obtener asignaturas de un usuario

module.exports = router;