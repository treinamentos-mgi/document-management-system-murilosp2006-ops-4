const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const multer = require('multer');

const storageDirectory = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');
const maxFileSizeBytes = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024;

fs.mkdirSync(storageDirectory, { recursive: true });

const documents = [];

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storageDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: maxFileSizeBytes },
}).single('file');

function saveDocument(owner, file) {
  const id = path.basename(file.filename, path.extname(file.filename));
  const document = {
    id,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };

  documents.push(document);
  return document;
}

function findDocumentsByOwner(owner) {
  return documents.filter((document) => document.owner === owner);
}

function findDocumentById(id, owner) {
  return documents.find((document) => document.id === id && document.owner === owner);
}

function getStoredFilePath(document) {
  const extension = path.extname(document.originalName);
  return path.join(storageDirectory, `${document.id}${extension}`);
}

module.exports = {
  uploadMiddleware,
  saveDocument,
  findDocumentsByOwner,
  findDocumentById,
  getStoredFilePath,
};
