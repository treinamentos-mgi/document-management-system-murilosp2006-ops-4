const path = require('node:path');

// Configuração via variáveis de ambiente (12-Factor App), com padrões locais.
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '..', 'storage');
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

module.exports = { STORAGE_DIR, MAX_FILE_SIZE_BYTES };
