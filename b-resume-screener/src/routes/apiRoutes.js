const express = require('express');
const ApiController = require('../controllers/apiController');

const router = express.Router();
const apiController = new ApiController();

function errorHandler(err, req, res, next) {
    console.error('Route error:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
}

function requestLogger(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
}

function setApiRoutes(app) {
    router.use(requestLogger);

    router.get('/api/data',
        (req, res, next) => {
            console.log('Processing GET request for document retrieval');
            next();
        },
        apiController.getData.bind(apiController)
    );

    router.post('/api/data',
        (req, res, next) => {
            console.log('Processing POST request for document upload');
            next();
        },
        apiController.postData.bind(apiController)
    );

    router.use(errorHandler);
    app.use(router);

    console.log('API routes configured successfully');
}

module.exports = setApiRoutes;