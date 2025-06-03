require('dotenv').config({path: '.env'});

module.exports = {
    service: process.env. EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER || 'sgtu.info@gmail.com',
    pass: process.env.EMAIL_PAS || 'offq vxmh azmk oewk',
    from: process.env.EMAIL_FROM_NAME ? `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>` : process.env.EMAIL_USER,
};