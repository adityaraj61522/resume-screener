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
}

module.exports = new RedisService();
