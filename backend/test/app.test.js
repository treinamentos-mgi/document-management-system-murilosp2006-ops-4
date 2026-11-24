const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');

async function startServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download seguem os contratos HTTP', async (context) => {
  const { server, baseUrl } = await startServer();
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.strictEqual(healthResponse.status, 200);
  assert.deepStrictEqual(await healthResponse.json(), { status: 'ok' });

  const missingOwnerResponse = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(missingOwnerResponse.status, 400);

  const missingFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-test' },
  });
  assert.strictEqual(missingFileResponse.status, 400);

  const form = new FormData();
  form.append('file', new Blob(['conteudo do documento'], { type: 'text/plain' }), 'documento.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-test' },
    body: form,
  });
  assert.strictEqual(uploadResponse.status, 201);

  const document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'documento.txt');
  assert.strictEqual(document.owner, 'user-test');
  assert.strictEqual(document.size, 21);

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'user-test' },
  });
  assert.strictEqual(listResponse.status, 200);
  const documents = await listResponse.json();
  assert.ok(documents.some((item) => item.id === document.id));

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'user-test' },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(downloadResponse.headers.get('content-type'), 'application/octet-stream');
  assert.strictEqual(downloadResponse.headers.get('content-disposition'), 'attachment; filename="documento.txt"');
  assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');

  const forbiddenResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'outro-usuario' },
  });
  assert.strictEqual(forbiddenResponse.status, 404);

  await fs.unlink(path.resolve(__dirname, '../storage', `${document.id}.txt`));
});
