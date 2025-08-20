const Redis = require('redis');

class RedisService {
    constructor() {
        console.log('Initializing Redis service...');
        this.client = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            retry_strategy: (options) => {
                console.log('Redis connection retry attempt:', options.attempt);
                if (options.attempt > 10) {
                    console.error('Maximum Redis connection attempts reached');
                    return new Error('Maximum Redis connection attempts reached');
                }
                return Math.min(options.attempt * 100, 3000);
            }
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        this.client.on('connect', () => {
            console.log('Redis client connected successfully');
        });

        this.client.on('reconnecting', () => {
            console.log('Redis client reconnecting...');
        });

        this.connect().catch(err => {
            console.error('Failed to connect to Redis:', err);
        });
    }

    async connect() {
        try {
            console.log('Connecting to Redis...');
            await this.client.connect();
            console.log('Redis connection established');
        } catch (error) {
            console.error('Redis connection error:', error);
            throw error;
        }
    }

    async storeDocument(key, data) {
        try {
            console.log(`Storing document in Redis with key: ${key}`);
            const jsonData = JSON.stringify(data);
            await this.client.set(key, jsonData);
            console.log(`Successfully stored document in Redis: ${key}`);
        } catch (error) {
            console.error(`Error storing document in Redis (key: ${key}):`, error);
            throw new Error(`Failed to store document in Redis: ${error.message}`);
        }
    }

    async getDocument(key) {
        try {
            console.log(`Retrieving document from Redis with key: ${key}`);
            const data = await this.client.get(key);
            if (!data) {
                console.warn(`Document not found in Redis: ${key}`);
                return null;
            }
            console.log(`Successfully retrieved document from Redis: ${key}`);
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error retrieving document from Redis (key: ${key}):`, error);
            throw new Error(`Failed to retrieve document from Redis: ${error.message}`);
        }
    }

    async scanKeys(pattern) {
        try {
            console.log(`Scanning Redis keys with pattern: ${pattern}`);

            const keys = [];
            let cursor = '0';  // cursor should be a string

            do {
                // Redis scan command expects MATCH and COUNT as separate arguments
                const result = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', '100');
                cursor = result.cursor;
                if (Array.isArray(result.keys)) {
                    // Filter out Bull queue keys
                    const filteredKeys = result.keys.filter(key => !key.startsWith('bull:'));
                    keys.push(...filteredKeys);
                }
            } while (cursor !== '0');  // cursor is returned as a string

            console.log(`Found ${keys.length} keys matching pattern: ${pattern}`);
            return keys;
        } catch (error) {
            console.error(`Error scanning Redis keys (pattern: ${pattern}):`, error);
            throw new Error(`Failed to scan Redis keys: ${error.message}`);
        }
    }

    async getAllUserDocuments(userEmail) {
        try {
            console.log(`Fetching all documents for user: ${userEmail}`);

            // First get all process IDs for this user, excluding Bull queue keys
            const processKeys = await this.scanKeys(`process:*`);
            console.log('Found process keys:', processKeys);

            // Verify each key is a string type before trying to get it
            const processes = [];
            for (const key of processKeys) {
                try {
                    const type = await this.client.type(key);
                    if (type === 'string') {
                        const doc = await this.getDocument(key);
                        if (doc) processes.push(doc);
                    } else {
                        console.log(`Skipping key ${key} of type ${type}`);
                    }
                } catch (err) {
                    console.warn(`Error checking key ${key}:`, err);
                    continue;
                }
            }

            console.log('Loaded processes:', processes);

            // Filter processes for this user
            const userProcesses = processes.filter(proc => proc?.userEmail === userEmail);
            console.log('User processes:', userProcesses);

            // Get all documents for these processes
            // Use : instead of _ to match the actual key format
            const documentKeys = await this.scanKeys(`document:${userEmail}*`);
            console.log('Found document keys:', documentKeys);

            if (documentKeys.length === 0) {
                console.log('No document keys found, trying alternate pattern...');
                // Try without : in case the format is different
                const altDocumentKeys = await this.scanKeys(`document:${userEmail.replace(/[@.]/g, '_')}*`);
                if (altDocumentKeys.length > 0) {
                    console.log('Found documents with alternate pattern:', altDocumentKeys);
                    documentKeys.push(...altDocumentKeys);
                }
            }

            // Verify each document key is a string type before trying to get it
            const documents = [];
            for (const key of documentKeys) {
                try {
                    const type = await this.client.type(key);
                    if (type === 'string') {
                        const doc = await this.getDocument(key);
                        if (doc) documents.push(doc);
                    } else {
                        console.log(`Skipping document key ${key} of type ${type}`);
                    }
                } catch (err) {
                    console.warn(`Error checking document key ${key}:`, err);
                    continue;
                }
            }

            console.log('Loaded documents:', documents);

            // Merge process and document data, ensuring unique submissions by processId and containing actual document content
            const submissions = documents.reduce((acc, doc) => {
                const process = userProcesses.find(p => p.processId === doc.processId);
                // Only add if we don't already have this processId AND the document has content (filename/analysis)
                if (!acc.some(s => s.processId === doc.processId) &&
                    (doc.filename || doc.content || doc.analysis)) {
                    acc.push({
                        ...doc,
                        totalFiles: process?.totalFiles,
                        completedFiles: process?.completedFiles,
                        overallStatus: process?.status
                    });
                }
                return acc;
            }, []);

            console.log(`Found ${submissions.length} unique submissions for user: ${userEmail}`);
            return submissions;
        } catch (error) {
            console.error(`Error fetching user documents (email: ${userEmail}):`, error);
            throw new Error(`Failed to fetch user documents: ${error.message}`);
        }
    }
}

module.exports = new RedisService();
