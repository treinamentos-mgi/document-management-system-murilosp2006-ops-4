const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const { diskStorage } = require('../repositories/file.storage');
const { MAX_FILE_SIZE_BYTES } = require('../config');

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

module.exports = router;
