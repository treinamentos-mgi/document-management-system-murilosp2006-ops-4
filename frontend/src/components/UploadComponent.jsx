import { useRef, useState } from 'react';
import { uploadDocument } from '../services/documentService.js';

export default function UploadComponent({ userId, onUploadSuccess }) {
  const formRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      await uploadDocument(userId, selectedFile);
      setSelectedFile(null);
      formRef.current?.reset();
      onUploadSuccess();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type="file"
        disabled={isUploading}
        onChange={(event) => setSelectedFile(event.target.files[0] ?? null)}
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </form>
  );
}
