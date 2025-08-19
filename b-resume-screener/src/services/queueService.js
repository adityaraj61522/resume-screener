const Queue = require('bull');
const redisService = require('./redisService');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
require('dotenv').config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const analyzeResume = async (resumeText, jobDescription) => {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [{
                role: "user",
                content: `Analyze this resume text and job description, then provide a structured evaluation. Return only a valid, parsable JSON object with the following exact structure and guidelines:

        Resume:
        ${resumeText}

        Job Description:
        ${jobDescription}

        {
            "name": "Full legal name in proper case",
            "phone": "Phone number in E.164 format (e.g. +1-234-567-8900)",
            "email": "Email address in lowercase",
            "skills": [
                "Array of skills, each properly capitalized",
                "Include both technical and soft skills",
                "Use standard terminology (e.g. 'JavaScript' not 'Javascript')"
            ],
            "rank": {
                "score": "Number between 0-100",
                "matches": [
                    "List of skills/experiences that match job requirements"
                ],
                "gaps": [
                    "List of missing skills/experiences from requirements"
                ]
            },
            "experience": "Number representing total years",
            "projects": [
                "Array of project names, properly capitalized"
            ],
            "sector": "Current industry sector, properly capitalized",
            "links": {
                "github": "Full GitHub profile URL if found",
                "linkedin": "Full LinkedIn profile URL if found",
                "portfolio": "Portfolio URL if found",
                "other": ["Array of other professional URLs"]
            }
        }

        Ensure all text fields use proper capitalization and standard industry terminology. Numbers should be actual numbers, not strings. URLs must be complete (e.g. https://github.com/username). Return only the JSON object with no additional text or explanation.`
            }],
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let aiResponse = response.data.choices[0].message.content;

        // Clean up the response if it's wrapped in markdown code blocks
        aiResponse = aiResponse.replace(/^\`\`\`json\n/, '')  // Remove leading ```json
            .replace(/^\`\`\`\n/, '')        // Remove leading ``` if no language specified
            .replace(/\n\`\`\`$/, '')        // Remove trailing ```
            .trim();                         // Remove any extra whitespace

        try {
            return JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            console.error('Raw AI response:', aiResponse);
            throw new Error('Failed to parse AI response as JSON');
        }
    } catch (error) {
        console.error('Error analyzing resume:', error);
        if (error.response?.data) {
            console.error('API error details:', error.response.data);
        }
        throw new Error('Failed to analyze resume with AI');
    }
};

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
    const { processId, userEmail, filename, content, timestamp, totalFiles, jobDescription } = job.data;

    try {
        console.log(`Processing document in queue: ${filename} for user: ${userEmail}`);

        // Analyze resume with AI
        console.log(`Analyzing resume: ${filename}`);
        const analysis = await analyzeResume(content, jobDescription);
        console.log(`Analysis completed for: ${filename}`);

        // Store the analyzed result
        const documentKey = `document:${userEmail}:${timestamp}`;
        await redisService.storeDocument(documentKey, {
            filename,
            content,
            timestamp,
            processId,
            status: 'completed',
            analysis
        });
        console.log(`Successfully stored analysis in Redis: ${filename} under key: ${documentKey}`);

        // Update process status
        const processKey = `process:${processId}`;
        const process = await redisService.getDocument(processKey);
        await updateProcessStatus(processKey, process.completedFiles + 1, totalFiles);

        return { status: 'success', documentKey, filename, analysis };
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
