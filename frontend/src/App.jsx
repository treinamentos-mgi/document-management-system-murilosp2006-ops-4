import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments } from './services/documentService.js';

export default function App() {
  const [userId, setUserId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const trimmedUserId = userId.trim();

  useEffect(() => {
    if (!trimmedUserId) {
      setDocuments([]);
      return undefined;
    }

    let ignore = false;
    setIsLoading(true);
    setErrorMessage('');

    listDocuments(trimmedUserId)
      .then((loadedDocuments) => {
        if (!ignore) setDocuments(loadedDocuments);
      })
      .catch((error) => {
        if (!ignore) setErrorMessage(error.message);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [trimmedUserId, refreshKey]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>

      <label>
        Identificador do usuário:{' '}
        <input
          type="text"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Ex.: joao"
        />
      </label>

      {trimmedUserId ? (
        <>
          <section>
            <h2>Enviar documento</h2>
            <UploadComponent
              userId={trimmedUserId}
              onUploadSuccess={() => setRefreshKey((key) => key + 1)}
            />
          </section>

          <section>
            <h2>Documentos</h2>
            {isLoading && <p>Carregando documentos...</p>}
            {errorMessage && <p role="alert">{errorMessage}</p>}
            {!isLoading && !errorMessage && (
              <DocumentList userId={trimmedUserId} documents={documents} />
            )}
          </section>
        </>
      ) : (
        <p>Informe um identificador de usuário para enviar e listar documentos.</p>
      )}
    </main>
  );
}
