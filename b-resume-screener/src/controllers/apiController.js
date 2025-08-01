// src/controllers/apiController.js

const documentService = require('../services/documentService');
const redisService = require('../services/redisService');

class ApiController {
    async getData(req, res) {
        try {
            const { documentId } = req.query;
            if (!documentId) {
                return res.status(400).json({ error: 'Document ID is required' });
            }

            const document = await redisService.getDocument(documentId);
            if (!document) {
                return res.status(404).json({ error: 'Document not found' });
            }

            res.json(document);
        } catch (error) {
            console.error('Error in getData:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async postData(req, res) {
        try {
            if (!req.files || !req.files.documents) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const zipFile = req.files.documents;
            if (!zipFile.name.toLowerCase().endsWith('.zip')) {
                return res.status(400).json({ error: 'Only ZIP files are accepted' });
            }

            // Using the tempFilePath provided by express-fileupload
            const results = await documentService.processZipFile(zipFile.tempFilePath);
            res.json({
                message: 'Files processed successfully',
                results
            });
        } catch (error) {
            console.error('Error in postData:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = ApiController;