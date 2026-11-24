const express = require('express');
const documentController = require('../controllers/document.controller');

const router = express.Router();

router.post('/upload', documentController.uploadMiddleware, documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
