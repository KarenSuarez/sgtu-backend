# Sistema de Gestión de Tutorías Universitarias (SGTU) - Backend

## 🚀 Overview

The **University Tutoring Management System (SGTU)** is a web-based platform designed to enhance the organization and traceability of academic tutoring sessions. It streamlines interaction between students and teachers by automating tutoring requests, scheduling, tracking, and notifications.

This repository contains the **backend services**, built with **Node.js** and **Express.js**, using **PostgreSQL** and **MongoDB** for data persistence, and **RabbitMQ** for asynchronous messaging. The architecture is modular, scalable, and maintainable.

## ✨ Key Features

- **Authentication & Authorization**: Secure login with JWT and role-based access control (Student, Teacher, Admin).
- **User Management**: Full CRUD for user accounts with dedicated roles.
- **Subject Management**: Manage academic subjects with CRUD operations.
- **Scheduling System**:
  - Manage academic class schedules and tutoring availability.
  - Teachers define recurring or date-specific availability.
- **Tutoring Lifecycle**:
  - Students submit tutoring requests for available subjects and time slots.
  - Automated validations (class conflicts, teacher availability, session overlaps).
  - Teachers can approve, reject, or cancel requests.
  - Sessions can be marked as `COMPLETED` or `NO_SHOW`.
- **Asynchronous Notifications**:
  - Email notifications via RabbitMQ and Nodemailer.
  - Observer pattern for flexible notification handling.
  - HTML-styled professional templates.
- **Activity Logging & Auditing**:
  - Logs stored in MongoDB for all key actions.
  - Endpoints available for querying logs.
- **Report Generation**:
  - Export tutoring and system data in JSON, CSV, XLSX, and PDF.
- **Containerized Environment**:
  - Uses Docker and Docker Compose for simplified setup and deployment.

## 💻 Technologies Used

- **Node.js**, **Express.js**
- **PostgreSQL** + **Sequelize**
- **MongoDB** + **Mongoose**
- **RabbitMQ** + `amqplib`
- **JWT**, **Bcrypt.js**, **Joi**
- **Nodemailer**, **ExcelJS**, **PDFKit**
- **dotenv**, **CORS**

## 🏛️ Architecture Highlights

- **Layered and Modular Design**: Organized into config, models, services, controllers, routes, and middleware.
- **RESTful APIs**: Backend exposes structured endpoints for frontend integration.
- **Polyglot Persistence**: PostgreSQL for transactional data, MongoDB for logs and reports.
- **Asynchronous Messaging**: Email and system tasks handled via RabbitMQ.
- **Dockerized Services**: Each component runs in a dedicated container.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+), npm
- Docker & Docker Compose

### Setup (Docker)

```bash
git clone https://github.com/KarenSuarez/sgtu-backend
cd sgtu-backend
cp .env.example .env  # Fill in the environment variables
docker-compose up --build -d
```

- API: http://localhost:3000/api  
- RabbitMQ UI: http://localhost:15672 (guest/guest)

### Development (Manual)

If running manually:

```bash
npm install
npm run dev
```

Make sure PostgreSQL, MongoDB, and RabbitMQ are running locally.

## 🌐 API Overview

Interactive docs available via Swagger:  
- 🔗 SwaggerHub Documentation (https://app.swaggerhub.com/apis/karensuarez-2d5/SGTU/1.0.0)

Some key endpoints:

- `POST /api/auth/login`: Authenticate user.
- `GET /api/users?role=teacher`: List users by role.
- `POST /api/tutorings/requests`: Submit tutoring request.
- `PATCH /api/tutorings/{id}/mark`: Mark session status.
- `GET /api/reports?type=X&format=PDF`: Export reports.

## 🧪 Testing

```bash
npm test
```

## 🤝 Contributing

We welcome contributions!  
1. Fork this repo  
2. Create a feature branch  
3. Commit with clear messages  
4. Submit a pull request

## ⁉️ Troubleshooting

- **CORS errors**: Check frontend URL in `cors` settings.
- **Database not connecting**: Verify credentials in `.env` and container health in `docker ps`.
- **Emails not sent**: Ensure RabbitMQ is running and consumer service is connected.
