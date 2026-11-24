const service = require('../services/documents');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo.' });
  }

  return res.status(201).json(service.save(req.file, req.body.owner));
}

function list(req, res) {
  res.json(service.list());
}

function download(req, res, next) {
  const document = service.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(service.filePath(document), document.originalName, (error) => {
    if (!error) return;
    if (res.headersSent) return next(error);
    return res.status(error.code === 'ENOENT' ? 404 : 500).json({
      error: 'Não foi possível baixar o documento.',
    });
  });
}

module.exports = { upload, list, download };
