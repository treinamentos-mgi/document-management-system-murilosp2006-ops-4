const path = require('node:path');
const repository = require('../repositories/documents');

const storagePath = path.resolve(__dirname, '../../storage');

function save(file, owner) {
  return repository.save({
    id: file.filename,
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || null,
  });
}

function list() {
  return repository.list();
}

function findById(id) {
  return repository.findById(id);
}

function filePath(document) {
  return path.join(storagePath, document.id);
}

module.exports = { storagePath, save, list, findById, filePath };
