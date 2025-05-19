require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const crypto = require('crypto');
const fs = require('fs/promises');
const filesService = require('../files/files.service');

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
});

const worker = new Worker(
    'file-processing',
    async (job) => {
        const { fileId, storagePath } = job.data;

        // Update status to processing
        await filesService.updateFileStatus(fileId, 'processing');

        try {
            // Simulate reading file and calculating hash
            const fileBuffer = await fs.readFile(storagePath);
            const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

            // Simulate processing delay
            await new Promise((r) => setTimeout(r, 3000));

            // Update status to processed and save extracted data (hash)
            await filesService.updateFileStatus(fileId, 'processed', hash);

            return { hash };
        } catch (err) {
            console.error('Processing failed:', err);
            await filesService.updateFileStatus(fileId, 'failed', err.message);
            throw err;
        }
    },
    { connection: redisConnection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed: ${err.message}`);
});
