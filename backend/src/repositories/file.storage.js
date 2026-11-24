const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');
const { STORAGE_DIR } = require('../config');

// Grava os arquivos enviados no filesystem local, com nome único para evitar colisões.
const diskStorage = multer.diskStorage({
  destination: STORAGE_DIR,
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

function resolveStoredFile(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = { diskStorage, resolveStoredFile };
