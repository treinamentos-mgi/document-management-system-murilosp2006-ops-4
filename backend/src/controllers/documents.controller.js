const documentsService = require('../services/documents.service');

const DEFAULT_OWNER = 'anonymous';

// Identifica o usuário pelo cabeçalho X-User-Id (gestão simples por usuário).
function getOwner(req) {
  return req.get('X-User-Id') || DEFAULT_OWNER;
}

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo no campo "file".' });
  }

  const document = documentsService.registerDocument({
    originalName: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    mimeType: req.file.mimetype,
    owner: getOwner(req),
  });

  return res.status(201).json(document);
}

function list(req, res) {
  res.json(documentsService.listDocumentsByOwner(getOwner(req)));
}

function download(req, res) {
  const info = documentsService.getDownloadInfo(req.params.id, getOwner(req));
  if (!info) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  res.download(info.filePath, info.originalName, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Arquivo não encontrado no armazenamento.' });
    }
  });
}

module.exports = { upload, list, download };
