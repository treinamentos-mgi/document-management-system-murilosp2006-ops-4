const documentRepository = require('../repositories/document.repository');

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function validateOwner(owner) {
  if (!owner || !owner.trim()) {
    throw createError(400, 'X-User-Id é obrigatório');
  }

  return owner.trim();
}

function uploadDocument(owner, file) {
  const normalizedOwner = validateOwner(owner);

  if (!file) {
    throw createError(400, 'Arquivo é obrigatório');
  }

  return documentRepository.saveDocument(normalizedOwner, file);
}

function listDocuments(owner) {
  const normalizedOwner = validateOwner(owner);
  return documentRepository.findDocumentsByOwner(normalizedOwner);
}

function getDocumentForDownload(owner, id) {
  const normalizedOwner = validateOwner(owner);
  const document = documentRepository.findDocumentById(id, normalizedOwner);

  if (!document) {
    throw createError(404, 'Documento não encontrado');
  }

  return {
    document,
    filePath: documentRepository.getStoredFilePath(document),
  };
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentForDownload,
  uploadMiddleware: documentRepository.uploadMiddleware,
};
