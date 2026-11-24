import { useState } from 'react';
import { downloadDocument } from '../services/documentService.js';

function saveBlobAsFile(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export default function DownloadButton({ userId, documentItem }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleClick() {
    setIsDownloading(true);
    setErrorMessage('');

    try {
      const blob = await downloadDocument(userId, documentItem.id);
      saveBlobAsFile(blob, documentItem.originalName);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {errorMessage && <span role="alert"> {errorMessage}</span>}
    </>
  );
}
