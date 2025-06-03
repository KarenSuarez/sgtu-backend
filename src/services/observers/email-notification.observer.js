const nodemailer = require('nodemailer');
const emailConfig = require('../../config/email');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: emailConfig.service,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
    },
});

class EmailNotificationObserver {
    async update({ type, recipientEmail, message: messageContent, metadata }) {
        try {
            // console.log('EmailObserver: Data recibida para email:', { type, recipientEmail, messageContent, metadata }); // DEBUG
            
            if (!recipientEmail) {
                console.error(`Error: No se proporcionó recipientEmail para notificación tipo ${type}.`);
                return;
            }

            let subject = 'Notificación SGTU';
            let htmlContent = messageContent;

            let templatePath = '';
            if (type === 'REQUEST_APPROVED') {
                templatePath = path.join(__dirname, '../../templates/tutorial-confirmation.html');
                subject = `Tutoría Aprobada: ${metadata.subjectName} con ${metadata.teacherName}`;
            } else if (type === 'REQUEST_REJECTED') {
                templatePath = path.join(__dirname, '../../templates/tutorial-cancellation.html');
                subject = `Tutoría Rechazada: ${metadata.subjectName} con ${metadata.teacherName}`;
            } else if (type === 'REMINDER') {
                templatePath = path.join(__dirname, '../../templates/tutorial-reminder.html');
                subject = `Recordatorio de Tutoría: ${metadata.subjectName} con ${metadata.teacherName}`;
            } else if (type === 'CANCELLATION') {
                templatePath = path.join(__dirname, '../../templates/tutorial-cancellation.html');
                subject = `Tutoría Cancelada: ${metadata.subjectName} con ${metadata.teacherName}`;
            } else if (type === 'PENDING_REQUEST') {
                templatePath = path.join(__dirname, '../../templates/tutorial-pending-request.html');
                subject = `Nueva Solicitud de Tutoría: ${metadata.subjectName} de ${metadata.studentName}`;
            }


            if (templatePath && fs.existsSync(templatePath)) {
                htmlContent = fs.readFileSync(templatePath, 'utf8');
                htmlContent = htmlContent.replace(/{{studentName}}/g, metadata.studentName || 'Estudiante');
                htmlContent = htmlContent.replace(/{{teacherName}}/g, metadata.teacherName || 'Docente');
                htmlContent = htmlContent.replace(/{{subjectName}}/g, metadata.subjectName || 'Asignatura');
                htmlContent = htmlContent.replace(/{{date}}/g, metadata.date || 'N/A');
                htmlContent = htmlContent.replace(/{{time}}/g, metadata.time || 'N/A');
                htmlContent = htmlContent.replace(/{{message}}/g, messageContent || '');
                htmlContent = htmlContent.replace(/{{rejectionReason}}/g, metadata.rejectionReason || 'No especificada.');
                htmlContent = htmlContent.replace(/{{cancellationReason}}/g, metadata.cancellationReason || 'No especificada.'); // Para cancelaciones
                htmlContent = htmlContent.replace(/{{systemName}}/g, emailConfig.from.split('"')[1] || 'SGTU');
            }


            const mailOptions = {
                from: emailConfig.from,
                to: recipientEmail,
                subject: subject,
                html: htmlContent,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Correo electrónico enviado a ${recipientEmail} para notificación tipo ${type}.`);
        } catch (error) {
            console.error(`Error enviando correo electrónico a ${recipientEmail}:`, error.message);
            if (error.code === 'EAUTH') {
                console.error('Error de autenticación SMTP: Asegúrate de que EMAIL_USER y EMAIL_PASS son correctos y válidos (ej. App Password de Gmail).');
            }
        }
    }
}

module.exports = EmailNotificationObserver;