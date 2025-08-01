// filepath: /express-server/express-server/src/app.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const setApiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    maxAge: 86400
};

app.use(cors(corsOptions));

app.use(bodyParser.json({
    limit: '100mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('Invalid JSON received:', e);
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '100mb'
}));

app.use(fileUpload({
    limits: {
        fileSize: 100 * 1024 * 1024
    },
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp'),
    debug: true,
    abortOnLimit: true,
    responseOnLimit: 'File size limit exceeded (100MB)',
    safeFileNames: true,
    preserveExtension: true
}));

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal server error',
        details: err.message
    });
});

setApiRoutes(app);

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Maximum file upload size: 100MB`);
    console.log(`Temporary files directory: ${path.join(__dirname, 'temp')}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});