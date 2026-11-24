const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');
const { resolveStoredFile } = require('../repositories/file.storage');

function registerDocument({ originalName, storedName, size, mimeType, owner }) {
  const saved = documentsRepository.save({
    id: randomUUID(),
    originalName,
    storedName,
    size,
    mimeType,
    owner,
    uploadedAt: new Date().toISOString(),
  });
  return toPublicDocument(saved);
}

function listDocumentsByOwner(owner) {
  return documentsRepository
    .findAll()
    .filter((document) => document.owner === owner)
    .map(toPublicDocument);
}

// Retorna o caminho do arquivo e o nome original para download, ou null se
// o documento não existir ou pertencer a outro usuário.
function getDownloadInfo(id, owner) {
  const document = documentsRepository.findById(id);
  if (!document || document.owner !== owner) {
    return null;
  }
  return {
    filePath: resolveStoredFile(document.storedName),
    originalName: document.originalName,
  };
}

// Oculta o nome interno do arquivo na resposta da API.
function toPublicDocument({ storedName, ...document }) {
  return document;
}

module.exports = { registerDocument, listDocumentsByOwner, getDownloadInfo };
