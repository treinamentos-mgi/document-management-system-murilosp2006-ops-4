const API_BASE_URL = '/api';
const DEFAULT_ERROR_MESSAGE = 'Erro ao comunicar com o servidor';

function buildHeaders(userId) {
  return { 'X-User-Id': userId };
}

async function ensureOk(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error || DEFAULT_ERROR_MESSAGE);
}

export async function listDocuments(userId) {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: buildHeaders(userId),
  });
  await ensureOk(response);
  return response.json();
}

export async function uploadDocument(userId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: buildHeaders(userId),
    body: formData,
  });
  await ensureOk(response);
  return response.json();
}

export async function downloadDocument(userId, documentId) {
  const response = await fetch(
    `${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/download`,
    { headers: buildHeaders(userId) },
  );
  await ensureOk(response);
  return response.blob();
}
