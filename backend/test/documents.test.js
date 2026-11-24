const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// O storage aponta para um diretório temporário antes de carregar o app.
const tempStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = tempStorageDir;

const app = require('../src/app');

let server;
let baseUrl;

function buildUploadForm(content, filename = 'contrato.txt', type = 'text/plain') {
  const form = new FormData();
  form.append('file', new Blob([content], { type }), filename);
  return form;
}

async function uploadDocument(owner, content = 'conteúdo do documento', filename) {
  return fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: buildUploadForm(content, filename),
  });
}

describe('API de documentos', () => {
  before(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(tempStorageDir, { recursive: true, force: true });
  });

  describe('POST /upload', () => {
    it('grava o arquivo em storage e retorna os metadados sem o nome interno', async () => {
      const response = await uploadDocument('ana', 'olá mundo', 'relatorio.txt');
      const body = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(body.originalName, 'relatorio.txt');
      assert.strictEqual(body.size, Buffer.byteLength('olá mundo'));
      assert.strictEqual(body.owner, 'ana');
      assert.ok(body.id, 'deve retornar um id');
      assert.ok(body.uploadedAt, 'deve retornar a data de envio');
      assert.strictEqual(body.storedName, undefined, 'o nome interno não deve ser exposto');

      const storedContents = fs
        .readdirSync(tempStorageDir)
        .map((name) => fs.readFileSync(path.join(tempStorageDir, name), 'utf8'));
      assert.ok(storedContents.includes('olá mundo'), 'o conteúdo deve ser gravado em disco');
    });

    it('usa "anonymous" como dono quando o cabeçalho X-User-Id não é enviado', async () => {
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: buildUploadForm('sem dono'),
      });
      const body = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(body.owner, 'anonymous');
    });

    it('retorna 400 quando nenhum arquivo é enviado', async () => {
      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: new FormData(),
      });

      assert.strictEqual(response.status, 400);
      assert.ok((await response.json()).error);
    });

    it('retorna 413 quando o arquivo excede o tamanho máximo', async () => {
      const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
      const response = await uploadDocument('ana', oversized, 'grande.bin');

      assert.strictEqual(response.status, 413);
    });
  });

  describe('GET /documents', () => {
    it('lista somente os documentos do usuário informado', async () => {
      const owner = 'listagem-user';
      await uploadDocument(owner, 'um', 'a.txt');
      await uploadDocument(owner, 'dois', 'b.txt');

      const response = await fetch(`${baseUrl}/documents`, {
        headers: { 'X-User-Id': owner },
      });
      const documents = await response.json();

      assert.strictEqual(response.status, 200);
      const names = documents.map((document) => document.originalName).sort();
      assert.deepStrictEqual(names, ['a.txt', 'b.txt']);
      assert.ok(documents.every((document) => document.owner === owner));
    });

    it('retorna lista vazia para um usuário sem documentos', async () => {
      const response = await fetch(`${baseUrl}/documents`, {
        headers: { 'X-User-Id': 'usuario-sem-arquivos' },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(await response.json(), []);
    });
  });

  describe('GET /documents/:id/download', () => {
    it('baixa o conteúdo original com o nome do arquivo enviado', async () => {
      const owner = 'download-user';
      const uploaded = await (await uploadDocument(owner, 'conteúdo baixado', 'baixar.txt')).json();

      const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`, {
        headers: { 'X-User-Id': owner },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(await response.text(), 'conteúdo baixado');
      assert.match(response.headers.get('content-disposition'), /baixar\.txt/);
    });

    it('retorna 404 para um id inexistente', async () => {
      const response = await fetch(`${baseUrl}/documents/id-inexistente/download`, {
        headers: { 'X-User-Id': 'ana' },
      });

      assert.strictEqual(response.status, 404);
    });

    it('retorna 404 quando o documento pertence a outro usuário', async () => {
      const uploaded = await (await uploadDocument('dono-original', 'privado', 'privado.txt')).json();

      const response = await fetch(`${baseUrl}/documents/${uploaded.id}/download`, {
        headers: { 'X-User-Id': 'outro-usuario' },
      });

      assert.strictEqual(response.status, 404);
    });
  });
});
