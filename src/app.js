// src/app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const moment = require("moment");
const { sequelize, connectPostgreSQL, connectMongoDB } = require('./config/database');


// 1. Importar TODOS los modelos de PostgreSQL PRIMERO
const Role = require('./models/postgres/role.model');
const User = require('./models/postgres/user.model');
const Student = require('./models/postgres/student.model');
const Professor = require('./models/postgres/professor.model');
const Subject = require('./models/postgres/subject.model');
const ClassSchedule = require('./models/postgres/class-schedule.model');
const UserSubject = require('./models/postgres/user-subject.model');
const AvailableSchedule = require('./models/postgres/availability-schedule.model');
const TutoringRequest = require('./models/postgres/tutorial-request.model'); // <-- NUEVO
const Tutoring = require('./models/postgres/tutorial.model'); // <-- NUEVO
const LogEntry = require('./models/mongo/log.model');

const Notification = require('./models/mongo/notification.model'); // <-- NUEVO
const SystemConfigurationModel = require('./models/mongo/system-configuration.model'); // <-- NUEVO

// Importar rutas y middlewares globales
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const tutorialRoutes = require('./routes/tutorial.routes');
const logRoutes = require('./routes/log.routes');
const notificationRoutes = require('./routes/notification.routes'); // <-- NUEVO
const systemConfigRoutes = require('./routes/system-config.routes'); // <-- NUEVO
const reportRoutes = require('./routes/report.routes');

const NotificationManager = require('./services/notification-manager'); // Importar el Singleton
const SystemConfigurationService = require('./services/system-configuration.service'); // Importar el Singleton
const EmailNotificationObserver = require('./services/observers/email-notification.observer');
const RabbitMQNotificationObserver = require('./services/observers/rabbitmq-notification.observer');
const DatabaseLogObserver = require('./services/observers/database-log.observer');
const { consumeMessages } = require('./rabbitmq/consumer'); // Para iniciar el consumidor de RabbitMQ
const queues = require('./rabbitmq/queues'); // Para obtener el nombre de la cola

const errorHandler = require('./middleware/error.middleware');

dotenv.config({ path: '.env' });

const app = express();
const PORT = process.env.PORT;

// --- Configuración de CORS ---
// Permite solicitudes desde cualquier origen para desarrollo.
// En producción, es recomendable restringir esto a los dominios de tu frontend.
app.use(cors({
    origin: 'http://localhost:4200', // <-- Reemplaza con el origen de tu frontend Angular
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));
// --- Fin Configuración de CORS ---
// 2. Definir todas las asociaciones una vez que todos los modelos están cargados
const defineAssociations = () => {
    // User - Role (One-to-Many)
    Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

    // User - Student (One-to-One)
    User.hasOne(Student, { foreignKey: 'userId', as: 'student', onDelete: 'CASCADE' });
    Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User - Professor (One-to-One)
    User.hasOne(Professor, { foreignKey: 'userId', as: 'professor', onDelete: 'CASCADE' });
    Professor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User - ClassSchedule (One-to-Many)
    User.hasMany(ClassSchedule, { foreignKey: 'userId', as: 'classSchedules' });
    ClassSchedule.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Subject - ClassSchedule (One-to-Many)
    Subject.hasMany(ClassSchedule, { foreignKey: 'subjectId', as: 'classSchedules' });
    ClassSchedule.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

    // User - Subject (Many-to-Many through UserSubject)
    User.belongsToMany(Subject, { through: UserSubject, foreignKey: 'userId', as: 'subjects' });
    Subject.belongsToMany(User, { through: UserSubject, foreignKey: 'subjectId', as: 'users' });

    // Professor - AvailableSchedule (One-to-Many)
    Professor.hasMany(AvailableSchedule, { foreignKey: 'teacherId', as: 'availableSchedules', onDelete: 'CASCADE' });
    AvailableSchedule.belongsTo(Professor, { foreignKey: 'teacherId', as: 'teacher' });

    // Student - TutoringRequest (One-to-Many)
    Student.hasMany(TutoringRequest, { foreignKey: 'studentId', as: 'tutoringRequests' });
    TutoringRequest.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

    // Professor - TutoringRequest (One-to-Many)
    Professor.hasMany(TutoringRequest, { foreignKey: 'teacherId', as: 'receivedTutoringRequests' });
    TutoringRequest.belongsTo(Professor, { foreignKey: 'teacherId', as: 'teacher' });

    // Subject - TutoringRequest (One-to-Many)
    Subject.hasMany(TutoringRequest, { foreignKey: 'subjectId', as: 'tutoringRequests' });
    TutoringRequest.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

    // Student - Tutoring (One-to-Many)
    Student.hasMany(Tutoring, { foreignKey: 'studentId', as: 'tutorings' });
    Tutoring.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

    // Professor - Tutoring (One-to-Many)
    Professor.hasMany(Tutoring, { foreignKey: 'teacherId', as: 'givenTutorings' });
    Tutoring.belongsTo(Professor, { foreignKey: 'teacherId', as: 'teacher' });

    // Subject - Tutoring (One-to-Many)
    Subject.hasMany(Tutoring, { foreignKey: 'subjectId', as: 'tutorings' });
    Tutoring.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

    // TutoringRequest - Tutoring (One-to-One)
    TutoringRequest.hasOne(Tutoring, { foreignKey: 'tutoringRequestId', as: 'tutoring' });
    Tutoring.belongsTo(TutoringRequest, { foreignKey: 'tutoringRequestId', as: 'request' });


    console.log('Asociaciones de Sequelize definidas.');
};


app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tutorings', tutorialRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/notifications', notificationRoutes); // <-- NUEVO
app.use('/api/system-config', systemConfigRoutes); // <-- NUEVO
app.use('/api/reports', reportRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Bienvenido al Backend del Sistema de Gestión de Tutorías Universitarias (SGTU)!');
});

// Middleware de manejo de errores global
app.use(errorHandler);

async function initializeDatabasesAndModels() {
    try {
        await connectPostgreSQL();
        defineAssociations();
        await sequelize.sync({ alter: true });
        console.log('Modelos de PostgreSQL (Sequelize) sincronizados exitosamente.');

        await Role.findOrCreate({ where: { name: 'student' }, defaults: { name: 'student' } });
        await Role.findOrCreate({ where: { name: 'teacher' }, defaults: { name: 'teacher' } });
        await Role.findOrCreate({ where: { name: 'admin' }, defaults: { name: 'admin' } });
        console.log('Roles básicos verificados/creados.');

        await connectMongoDB();
        console.log('Todos los modelos y conexiones de BD inicializados.');

        // --- Configuración e inicialización de Notificaciones ---
        const notificationManager = NotificationManager.getInstance();
        notificationManager.addObserver(new EmailNotificationObserver());
        notificationManager.addObserver(new RabbitMQNotificationObserver());
        notificationManager.addObserver(new DatabaseLogObserver());
        console.log('NotificationManager y Observadores inicializados.');

        // Iniciar consumidor de RabbitMQ para procesar mensajes de notificación
        // El consumer se encarga de llamar a los observadores si esa es la lógica deseada,
        // o si es un paso final para enviar emails/otras acciones.
        // En este setup, el EmailNotificationObserver es el que se suscribe al NotificationManager.
        // Y el NotificationManager envía directamente a la cola.
        // Por lo tanto, el consumidor sólo necesita saber cómo procesar el mensaje.
        // Aquí se puede iniciar el consumidor, que tendrá su propio manejador.
        // La instancia del NotificationService ya inicia su consumidor en su constructor.
        // Por lo tanto, la línea siguiente puede ser redundante o ser el punto de partida para otros consumidores.
        // await consumeMessages(queues.NOTIFICATION_QUEUE, async (message) => {
        //     // Aquí el mensaje recibido de RabbitMQ podría ser procesado
        //     // por ejemplo, llamar a un servicio que envíe el email real.
        //     // Para este diseño, el EmailNotificationObserver ya se encarga al ser notificado por el Manager.
        //     console.log('Mensaje recibido de RabbitMQ para procesamiento posterior (si aplica):', message);
        // });
        
        // Cargar configuraciones del sistema
        const systemConfigService = SystemConfigurationService.getInstance();
        await systemConfigService.loadConfigurations();
        console.log('Configuraciones del sistema cargadas.');

        // --- Fin Configuración de Notificaciones ---


        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
            console.log(`Accede a la API en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error durante la inicialización del sistema:', error);
        process.exit(1);
    }
}

initializeDatabasesAndModels();