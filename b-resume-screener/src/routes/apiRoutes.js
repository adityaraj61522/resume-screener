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
    // Mount the router at /api
    app.use('/api', router);

    router.use(requestLogger);

    // Routes now don't need /api prefix since we mounted the router at /api
    router.get('/submissions', (req, res, next) => {
        console.log('Processing GET request for user submissions');
        next();
    }, apiController.getSubmissions.bind(apiController));

    router.get('/data', (req, res, next) => {
        console.log('Processing GET request for document retrieval');
        next();
    }, apiController.getData.bind(apiController));

    router.post('/data', (req, res, next) => {
        console.log('Processing POST request for document upload');
        next();
    }, apiController.postData.bind(apiController));

    router.use(errorHandler);

    console.log('API routes configured successfully');
}

module.exports = setApiRoutes;