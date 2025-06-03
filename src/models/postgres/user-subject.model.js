// src/models/postgres/user-subject.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserSubject = sequelize.define('UserSubject', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'user_id',
        // Referencia se definirá en app.js
    },
    subjectId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'subject_id',
        // Referencia se definirá en app.js
    },
}, {
    tableName: 'UserSubjects',
    timestamps: false,
    underscored: true,
});

// UserSubject.associate = (models) => {
//     // Las asociaciones Many-to-Many se definen en los modelos principales (User y Subject)
// };

module.exports = UserSubject;