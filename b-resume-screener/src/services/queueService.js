const Queue = require('bull');
const redisService = require('./redisService');
const { v4: uuidv4 } = require('uuid');

// Create a new queue for document processing
const documentQueue = new Queue('document-processing', {
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
});

// Create a new process entry in Redis
const createProcessEntry = async (processId, userEmail, totalFiles) => {
    const processKey = `process:${processId}`;
    await redisService.storeDocument(processKey, {
        processId,
        userEmail,
        totalFiles,
        completedFiles: 0,
        status: 'pending',
        timestamp: new Date().toISOString()
    });
    return processKey;
};

// Update process status in Redis
const updateProcessStatus = async (processKey, completedFiles, totalFiles) => {
    const process = await redisService.getDocument(processKey);
    process.completedFiles = completedFiles;
    process.status = completedFiles === totalFiles ? 'completed' : 'pending';
    await redisService.storeDocument(processKey, process);
};

// Process jobs in the queue
documentQueue.process(async (job) => {
    const { processId, userEmail, filename, content, timestamp, totalFiles } = job.data;

    try {
        console.log(`Processing document in queue: ${filename} for user: ${userEmail}`);

        // Store the document content
        const documentKey = `document:${userEmail}:${timestamp}`;
        await redisService.storeDocument(documentKey, {
            filename,
            content,
            timestamp,
            processId,
            status: 'completed'
        });
        console.log(`Successfully stored document in Redis: ${filename} under key: ${documentKey}`);

        // Update process status
        const processKey = `process:${processId}`;
        const process = await redisService.getDocument(processKey);
        await updateProcessStatus(processKey, process.completedFiles + 1, totalFiles);

        return { status: 'success', documentKey, filename };
    } catch (error) {
        console.error(`Error processing document in queue ${filename}:`, error);
        throw error;
    }
});

// Handle completed jobs
documentQueue.on('completed', (job) => {
    const { filename, processId } = job.data;
    console.log(`Job ${job.id} completed for file: ${filename} in process ${processId}`);
});

// Handle failed jobs
documentQueue.on('failed', (job, error) => {
    const { filename, processId } = job.data;
    console.error(`Job ${job.id} failed for file: ${filename} in process ${processId}:`, error);
});

module.exports = {
    documentQueue,
    createProcessEntry
};
