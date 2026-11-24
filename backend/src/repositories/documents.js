const documents = [];

function save(document) {
  documents.push(document);
  return document;
}

function list() {
  return documents;
}

function findById(id) {
  return documents.find((document) => document.id === id);
}

module.exports = { save, list, findById };
