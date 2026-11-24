# Especificação - Document Management System

> Especificação derivada de `docs/specs/spec-template.md`, para orientar o
> desenvolvimento guiado por especificação (Spec Driven Development).

## 1. Objetivo

Entregar um sistema web que permita a usuários enviar, listar e baixar documentos, com armazenamento local no filesystem da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (com limite de tamanho de 10 MB)
- Listagem dos documentos enviados
- Download de documentos pelo identificador
- Gestão simples por usuário, identificado pelo header `X-User-Id`
- Endpoint de verificação de saúde `GET /health`

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação e autorização completas (senha, sessão, tokens)
- Persistência em banco de dados (metadados ficam em memória nesta fase)
- Restrição de tipos de arquivo nesta fase
- Edição ou exclusão de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                                  | Critérios de aceitação                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento                                                         | Aceita multipart com campo `file`; retorna 201 com metadados; 400 se o arquivo estiver ausente; 413 se exceder 10 MB; 400 se `X-User-Id` estiver ausente |
| RF-02 | O usuário pode listar os documentos enviados                                               | Retorna 200 com a lista de metadados dos documentos do usuário informado em `X-User-Id`; lista vazia quando não há documentos |
| RF-03 | O usuário pode baixar um documento pelo identificador                                      | Retorna 200 com o conteúdo binário e `Content-Disposition` com o `originalName`; 404 se o id não existir ou pertencer a outro usuário |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local em `backend/storage` via multer com `diskStorage`                     |
| RNF-02 | Metadados mantidos em memória nesta fase                                                                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES`            |
| RNF-04 | Backend em Clean Architecture simples, com fluxo `routes -> controllers -> services -> repositories`        |
| RNF-05 | Testes do backend com o runner nativo `node:test`                                                           |
| RNF-06 | Erros nos limites do sistema (entrada HTTP, leitura e escrita de arquivos) são tratados e retornam JSON `{ "error": string }` |
| RNF-07 | Nomes de símbolos em inglês; mensagens ao usuário e comentários em português                                 |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                                                 |
| ------------ | ------ | ------------------------------------------------------------------------- |
| id           | string | Identificador único do documento (UUID v4)                                |
| originalName | string | Nome original do arquivo enviado                                          |
| size         | number | Tamanho em bytes (inteiro, maior ou igual a 1)                            |
| uploadedAt   | string | Data e hora do upload em ISO 8601 (UTC)                                   |
| owner        | string | Valor do header `X-User-Id` no momento do upload (não vazio)              |

Observações:

- O nome físico do arquivo em disco é o `id` seguido da extensão original, mantido apenas pelo repositório de arquivos. Não é exposto na API.
- Os metadados são perdidos ao reiniciar o servidor, conforme RNF-02.

## 6. Contratos de API

Todas as respostas de erro seguem o formato `{ "error": "mensagem em português" }`.

### GET /health

- Saída `200`: `{ "status": "ok" }`

### POST /upload

- Cabeçalhos: `X-User-Id: string` (obrigatório), `Content-Type: multipart/form-data`
- Entrada: campo `file` contendo o arquivo
- Saída `201`: metadados do documento criado

```json
{
  "id": "3f2c1e9a-8b7d-4c6e-9a1f-2d3e4f5a6b7c",
  "originalName": "contrato.pdf",
  "size": 204800,
  "uploadedAt": "2026-11-24T12:00:00.000Z",
  "owner": "user-1"
}
```

- Erros: `400` (arquivo ausente ou `X-User-Id` ausente), `413` (arquivo maior que 10 MB)

### GET /documents

- Cabeçalhos: `X-User-Id: string` (obrigatório)
- Saída `200`: array de metadados dos documentos do usuário
- Erros: `400` (`X-User-Id` ausente)

### GET /documents/:id/download

- Cabeçalhos: `X-User-Id: string` (obrigatório)
- Saída `200`: conteúdo binário, com `Content-Type: application/octet-stream` e `Content-Disposition: attachment; filename="<originalName>"`
- Erros: `400` (`X-User-Id` ausente), `404` (documento inexistente ou de outro usuário)

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples: `routes/` define os endpoints, `controllers/` trata HTTP e validação básica, `services/` contém as regras de negócio e `repositories/` faz a persistência (arquivos em disco e metadados em memória).
- Camadas internas não conhecem camadas externas.
- Backend em Node.js + Express (CommonJS), sem TypeScript.
- Frontend em React + Vite (ESM), com componentes funcionais e Hooks, organizado em `components/`, `pages/` e `services/`.
- Frontend se comunica com o backend via `fetch` com prefixo `/api`, configurado como proxy no Vite.
- Armazenamento estritamente local à aplicação; nenhum provedor externo.

## 8. Plano de execução

Cada etapa deve ser concluída antes da seguinte, salvo indicação de paralelismo.

1. **Configuração e variáveis de ambiente**: ler `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES` com valores padrão. Dependência: nenhuma.
2. **Repositório de arquivos**: gravar e ler arquivos em `backend/storage` com multer `diskStorage`. Dependência: etapa 1.
3. **Repositório de metadados**: armazenar e consultar metadados em memória, filtrando por `owner`. Dependência: nenhuma (paralelo à etapa 2).
4. **Service de documentos**: regras de upload, listagem e download, incluindo verificação de propriedade. Dependência: etapas 2 e 3.
5. **Controller e rota de upload** (`POST /upload`) com validação de `X-User-Id`, tamanho e tratamento de erros 400 e 413. Dependência: etapa 4.
6. **Controller e rota de listagem** (`GET /documents`). Dependência: etapa 4.
7. **Controller e rota de download** (`GET /documents/:id/download`) com 404. Dependência: etapa 4.
8. **Testes do backend** com `node:test` cobrindo RF-01 a RF-03 e os erros definidos. Dependência: etapas 5 a 7.
9. **Componentes de upload e listagem no frontend**, com `fetch` via `/api` e envio do header `X-User-Id`. Dependência: etapas 5 e 6 (contratos fixados). Paralelo às etapas 7 e 8.
10. **Componente de download no frontend** e tratamento de erros exibidos ao usuário. Dependência: etapa 7 e etapa 9.
11. **Integração e revisão final**: validar o proxy do Vite, executar os testes e conferir a conformidade com este documento. Dependência: etapas 8 e 10.

## Critérios de conclusão

- Todos os requisitos funcionais e não funcionais atendidos.
- Testes do backend passando com `node:test`.
- Nenhum endpoint diferente dos definidos na seção 6.
