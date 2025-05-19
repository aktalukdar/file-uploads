const prisma = require('../prisma');

async function createFileRecord({
    userId,
    originalFilename,
    storagePath,
    title,
    description,
    size,
    mimeType,
    extension
}) {
    return prisma.file.create({
        data: {
            userId,
            originalFilename,
            storagePath,
            title,
            description,
            status: 'uploaded',
            size,
            mimeType,
            extension
        },
    });
}

async function updateFileStatus(id, status, extractedData = null) {
    return prisma.file.update({
        where: { id },
        data: { status, extractedData },
    });
}

async function getFileById(id) {
    return prisma.file.findUnique({ where: { id } });
}

module.exports = {
    createFileRecord,
    updateFileStatus,
    getFileById,
};
