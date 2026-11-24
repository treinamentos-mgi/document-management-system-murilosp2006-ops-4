const multer = require('multer');

// Converte erros de upload e erros inesperados em respostas JSON.
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      status === 413 ? 'Arquivo excede o tamanho máximo permitido.' : 'Falha no envio do arquivo.';
    return res.status(status).json({ error: message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
