const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { readFile, rm } = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');

test('upload, listagem e download de documentos', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const emptyList = await fetch(`${baseUrl}/documents`);
  assert.equal(emptyList.status, 200);
  assert.deepEqual(await emptyList.json(), []);

  const missingFile = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: new FormData(),
  });
  assert.equal(missingFile.status, 400);

  const oversizedForm = new FormData();
  oversizedForm.append('file', new Blob([Buffer.alloc(10 * 1024 * 1024 + 1)]), 'grande.txt');
  const oversizedFile = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: oversizedForm,
  });
  assert.equal(oversizedFile.status, 413);

  const unknownDocument = await fetch(`${baseUrl}/documents/inexistente/download`);
  assert.equal(unknownDocument.status, 404);

  const content = 'Conteúdo do documento';
  const form = new FormData();
  form.append('file', new Blob([content], { type: 'text/plain' }), 'documento.txt');
  form.append('owner', 'usuário');
  const upload = await fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
  assert.equal(upload.status, 201);
  const document = await upload.json();
  assert.match(document.id, /^[\da-f-]{36}$/);
  const storedPath = path.join(__dirname, '../storage', document.id);
  t.after(() => rm(storedPath, { force: true }));
  assert.equal(document.originalName, 'documento.txt');
  assert.equal(document.size, Buffer.byteLength(content));
  assert.equal(document.owner, 'usuário');
  assert.ok(!Number.isNaN(Date.parse(document.uploadedAt)));
  assert.equal(await readFile(storedPath, 'utf8'), content);

  const list = await fetch(`${baseUrl}/documents`);
  assert.equal(list.status, 200);
  assert.deepEqual(await list.json(), [document]);

  const download = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.equal(download.status, 200);
  assert.match(download.headers.get('content-disposition'), /documento\.txt/);
  assert.equal(await download.text(), content);

  await rm(storedPath);
  const missingStoredFile = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.equal(missingStoredFile.status, 404);

  let limitedResponse;
  for (let i = 0; i < 100; i += 1) {
    limitedResponse = await fetch(`${baseUrl}/upload`, { method: 'POST' });
  }
  assert.equal(limitedResponse.status, 429);
});
