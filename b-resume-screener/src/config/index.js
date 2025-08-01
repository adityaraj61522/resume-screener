// src/config/index.js

const dotenv = require('dotenv');

dotenv.config();

const config = {
    PORT: process.env.PORT || 5000,
    API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
};

module.exports = config;