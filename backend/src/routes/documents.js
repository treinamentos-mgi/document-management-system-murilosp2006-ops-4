const { randomUUID } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const multer = require('multer');
const controller = require('../controllers/documents');
const { storagePath } = require('../services/documents');

mkdirSync(storagePath, { recursive: true });

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
  storage: multer.diskStorage({
    destination: storagePath,
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
});

const router = express.Router();
const uploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { error: 'Muitos envios. Tente novamente mais tarde.' },
});
router.post('/upload', uploadLimit, upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);
router.use((error, req, res, next) => {
  if (!(error instanceof multer.MulterError)) return next(error);
  return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
    error: 'Não foi possível enviar o arquivo.',
  });
});

module.exports = router;
