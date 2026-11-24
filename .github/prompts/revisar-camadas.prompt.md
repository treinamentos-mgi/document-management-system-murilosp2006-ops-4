---
description: Revisa um módulo do backend quanto às camadas, ao armazenamento local e ao tratamento de erros.
name: revisar-camadas
argument-hint: caminho do arquivo ou recurso (ex. backend/src/services/documents.service.js)
agent: agent
---

# Revisar camadas do backend

Revise o código `${input:alvo:caminho do arquivo ou recurso}` e aponte desvios das convenções do projeto. Não altere arquivos; apenas reporte.

Verifique:

1. **Fluxo de dependência**: `routes -> controllers -> services -> repositories`. Camadas internas não podem importar camadas externas (ex.: um service não pode importar um controller ou uma rota).
2. **Responsabilidades**:
   - `routes` apenas definem endpoints e delegam aos controllers.
   - `controllers` tratam HTTP e validação básica, sem regra de negócio.
   - `services` concentram regras de negócio, sem acesso direto a `req`/`res`.
   - `repositories` cuidam apenas da persistência.
3. **Armazenamento**: arquivos gravados somente em `backend/storage` via multer com `diskStorage`. Nenhum serviço externo de upload.
4. **Metadados**: mantidos em memória nesta fase.
5. **Tratamento de erros**: presente nos limites do sistema (entrada HTTP e leitura/escrita de arquivos).
6. **Estilo**: nomes descritivos em inglês; funções pequenas; mensagens ao usuário em português.

Formato da resposta:

- Lista de achados, cada um com arquivo, linha, regra violada e sugestão de correção.
- Se nenhum desvio for encontrado, informe isso explicitamente.
