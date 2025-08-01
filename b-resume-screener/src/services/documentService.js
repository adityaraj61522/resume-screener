const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AdmZip = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const redisService = require('./redisService');

class DocumentService {
    async processZipFile(zipFilePath) {
        console.log(`Starting to process ZIP file: ${zipFilePath}`);
        const extractPath = path.join(__dirname, '../temp', uuidv4());

        try {
            await fsp.mkdir(extractPath, { recursive: true });
            console.log(`Created temporary directory: ${extractPath}`);

            const extractedFiles = await this.extractZip(zipFilePath, extractPath);
            console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);

            const results = [];
            for (const filePath of extractedFiles) {
                const filename = path.basename(filePath);
                const extension = path.extname(filename).toLowerCase();
                console.log(`Processing file: ${filename} (${extension})`);
                let text = '';

                try {
                    switch (extension) {
                        case '.pdf':
                            text = await this.extractTextFromPdf(filePath);
                            break;
                        case '.docx':
                            console.log(`Extracting text from DOCX: ${filename}`);
                            const result = await mammoth.extractRawText({
                                path: filePath
                            });
                            text = result.value;
                            console.log(`Successfully extracted text from DOCX: ${filename}`);
                            break;
                        case '.txt':
                            console.log(`Reading text file: ${filename}`);
                            text = await fsp.readFile(filePath, 'utf-8');
                            console.log(`Successfully read text file: ${filename}`);
                            break;
                    }

                    if (text) {
                        const documentId = uuidv4();
                        console.log(`Storing document in Redis: ${filename}`);
                        await redisService.storeDocument(documentId, {
                            filename: filename,
                            content: text,
                            timestamp: new Date().toISOString()
                        });
                        console.log(`Successfully stored document in Redis: ${filename} (ID: ${documentId})`);

                        results.push({
                            documentId,
                            filename: filename,
                            status: 'success'
                        });
                    } else {
                        console.warn(`No text content extracted from file: ${filename}`);
                    }
                } catch (err) {
                    console.error(`Error processing file ${filename}:`, err);
                    results.push({
                        filename,
                        status: 'error',
                        error: err.message
                    });
                }
            }

            console.log(`Processing completed. Success: ${results.filter(r => r.status === 'success').length}, Failures: ${results.filter(r => r.status === 'error').length}`);
            return results;
        } catch (error) {
            console.error('Fatal error during file processing:', error);
            throw error;
        } finally {
            console.log(`Cleaning up temporary directory: ${extractPath}`);
            try {
                await fsp.rm(extractPath, { recursive: true, force: true });
                console.log('Cleanup completed successfully');
            } catch (error) {
                console.error('Error during cleanup:', error);
            }
        }
    }

    async extractZip(zipPath, destFolder) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Reading ZIP file: ${zipPath}`);
                const zip = new AdmZip(zipPath);
                const zipEntries = zip.getEntries();
                console.log(`Found ${zipEntries.length} entries in ZIP file`);

                const extractedFiles = [];
                const validExtensions = ['.pdf', '.docx', '.txt'];

                zipEntries.forEach((entry) => {
                    const entryName = entry.entryName;
                    const extension = path.extname(entryName).toLowerCase();
                    const isHiddenFile = path.basename(entryName).startsWith('._') ||
                        entryName.startsWith('__MACOSX');

                    if (!isHiddenFile && validExtensions.includes(extension)) {
                        const outputPath = path.join(destFolder, path.basename(entryName));
                        console.log(`Extracting file: ${entryName}`);
                        zip.extractEntryTo(entry, destFolder, false, true);
                        extractedFiles.push(outputPath);
                    } else {
                        console.log(`Skipping file: ${entryName} (hidden: ${isHiddenFile}, extension: ${extension})`);
                    }
                });

                if (extractedFiles.length === 0) {
                    const error = new Error('No valid documents found in the ZIP file.');
                    console.error(error);
                    reject(error);
                }

                console.log(`Successfully extracted ${extractedFiles.length} valid files`);
                resolve(extractedFiles);
            } catch (error) {
                reject(new Error(`Failed to extract ZIP file: ${error.message}`));
            }
        });
    }

    async extractTextFromPdf(pdfPath) {
        console.log(`Processing PDF file: ${pdfPath}`);
        try {
            const data = await fsp.readFile(pdfPath);
            console.log(`Successfully read PDF file: ${path.basename(pdfPath)}`);
            const pdfData = await pdfParse(data);
            console.log(`Successfully extracted text from PDF: ${path.basename(pdfPath)}`);
            return pdfData.text;
        } catch (error) {
            console.error(`PDF processing error for ${path.basename(pdfPath)}:`, error);
            throw new Error(`Failed to extract text from PDF ${path.basename(pdfPath)}: ${error.message}`);
        }
    }
}

module.exports = new DocumentService();
