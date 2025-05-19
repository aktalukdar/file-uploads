const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const authMiddleware = require('../auth/auth.middleware');
const filesService = require('./files.service');
const fs = require('fs');

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');
const MAX_FILE_SIZE_IN_MB = process.env.MAX_FILE_SIZE_IN_MB || 5;

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Setup multer disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        // prefix timestamp + original name for uniqueness
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_IN_MB * 1024 * 1024 }, // 5 MB limit
});

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
});
const fileQueue = new Queue('file-processing', { connection: redisConnection });

// Protect all routes here with auth
router.use(authMiddleware);

// POST /upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'File required' });

        const { title, description } = req.body;
        const userId = req.user.id;

        const fileObj = {
            userId,
            originalFilename: req.file.originalname,
            storagePath: req.file.path,
            title,
            description,
            size: req.file.size,
            mimeType: req.file.mimetype,
            extension: path.extname(req.file.originalname).slice(1).toLowerCase()
        };
        const fileRecord = await filesService.createFileRecord(fileObj);

        // Add job to queue for processing
        await fileQueue.add('process-file', {
            fileId: fileRecord.id,
            storagePath: req.file.path,
        });

        res.json({ fileId: fileRecord.id, status: 'uploaded' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /files/:id
router.get('/files/:id', async (req, res) => {
    try {
        const fileId = parseInt(req.params.id);
        if (isNaN(fileId)) return res.status(400).json({ error: 'Invalid file ID' });

        const file = await filesService.getFileById(fileId);
        if (!file) return res.status(404).json({ error: 'File not found' });

        // Only owner can access
        if (file.userId !== req.user.id)
            return res.status(403).json({ error: 'Access denied' });

        res.json({
            id: file.id,
            originalFilename: file.originalFilename,
            title: file.title,
            description: file.description,
            status: file.status,
            extractedData: file.extractedData,
            uploadedAt: file.uploadedAt,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
