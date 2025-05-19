# 📁 File Upload Service

This is a secure backend service for user authentication and file uploads with metadata, file processing queue (using BullMQ + Redis), and PostgreSQL via Prisma ORM.

## 🚀 Features

- JWT-based user authentication (signup & login)
- File uploads using `multer` with size limit & disk storage
- Metadata (title, description, extension, etc.) stored in DB
- File size limits via environment config
- Redis queue for async processing of uploaded files
- Prisma + PostgreSQL ORM
- Auto `updatedAt` timestamps
- `.env` driven config (file size limit, Redis, DB, etc.)

## 🧱 Tech Stack

- Node.js + Express
- Prisma ORM + PostgreSQL
- Multer for file handling
- BullMQ + Redis for background processing
- bcrypt + JWT for authentication

---
## Prerequisites

Version used:

- **Node.js**: v20.x  
- **PostgreSQL**: v14  
- **Redis**: v8 
___

## 📦 Installation

```bash
git clone git@github.com:aktalukdar/file-uploads.git
cd file-uploads
npm install
```

## ⚙️ Environment Setup

Create a `.env` file:

```ini
DATABASE_URL=postgresql://youruser:yourpass@localhost:5432/fileuploaddb
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
MAX_FILE_SIZE_IN_MB=5
```
## Install dependencies
```bash
npm install
```
## 🧪 Run Migrations

```bash
npx prisma migrate dev --name init
```

## 🚦 Run the Server

```bash
npm start
```

---

## 🔐 API Routes

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`

### Files

- `POST /api/v1/fileUploads/upload` (Authenticated, accepts `multipart/form-data`)
- `GET /api/v1/fileUploads/files/:id` (Authenticated, fetch file metadata)

---

## 📁 File Metadata

Each file stored includes:

- `originalFilename`
- `storagePath`
- `title`, `description`
- `status` (`uploaded`, `processing`, `processed`, `failed`)
- etc.

---

