require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth/auth.controller');
const filesRoutes = require('./files/files.controller');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE_IN_MB = process.env.MAX_FILE_SIZE_IN_MB || 5;

// Create upload directory if missing
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const app = express();

app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/fileUploads', filesRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
    console.error(err);
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: `File size is too large. Max limit is ${MAX_FILE_SIZE_IN_MB}MB.` });
    }
    let message = err.message || 'Internal server error';
    res.status(500).json({ error: message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
