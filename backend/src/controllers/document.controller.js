const documentService = require('../services/document.service');

function upload(req, res, next) {
  try {
    const document = documentService.uploadDocument(req.get('X-User-Id'), req.file);
    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function list(req, res, next) {
  try {
    const documents = documentService.listDocuments(req.get('X-User-Id'));
    return res.status(200).json(documents);
  } catch (error) {
    return next(error);
  }
}

function download(req, res, next) {
  try {
    const { document, filePath } = documentService.getDocumentForDownload(
      req.get('X-User-Id'),
      req.params.id,
    );

    const safeFilename = document.originalName.replace(/([\\"])/g, '\\$1');
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${safeFilename}"`);

    return res.sendFile(filePath, (error) => {
      if (error) {
        next(error);
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  uploadMiddleware: documentService.uploadMiddleware,
  upload,
  list,
  download,
};
