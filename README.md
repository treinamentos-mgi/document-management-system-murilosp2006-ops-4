# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey murilosp2006-ops!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-mgi/document-management-system-murilosp2006-ops-4/issues/1)

## API de documentos

- `POST /upload`: envie `multipart/form-data` com o campo `file` e,
  opcionalmente, `owner`. O tamanho máximo do arquivo é 10 MiB; são permitidas
  100 requisições de upload por IP a cada 15 minutos.
- `GET /documents`: lista os metadados dos documentos.
- `GET /documents/:id/download`: baixa o arquivo correspondente.

Os arquivos ficam em `backend/storage` e os metadados permanecem em memória
apenas até o servidor reiniciar. O campo `owner` não é uma autenticação.

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
