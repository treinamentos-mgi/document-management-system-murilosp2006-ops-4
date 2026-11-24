import DownloadButton from './DownloadButton.jsx';

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ userId, documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((documentItem) => (
          <tr key={documentItem.id}>
            <td>{documentItem.originalName}</td>
            <td>{formatFileSize(documentItem.size)}</td>
            <td>{new Date(documentItem.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>
              <DownloadButton userId={userId} documentItem={documentItem} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
