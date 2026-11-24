---
description: Valida uma alteração no backend ou frontend antes de finalizar a tarefa.
name: validar-alteracao
argument-hint: arquivos ou área alterada (ex. backend/src/services/document.service.js)
agent: agent
---

# Validar alteração

Valide a alteração relacionada a `${input:alvo:arquivos ou area alterada}` no estado atual do workspace.

Execute somente verificações pertinentes à alteração:

1. Identifique os arquivos alterados com `git diff --stat` e `git diff -- <alvo>`.
2. Para alterações no backend:
   - execute `cd backend && npm test`;
   - verifique erros com o lint disponível no projeto, se houver.
3. Para alterações no frontend:
   - execute `cd frontend && npm run build`;
   - verifique erros com o lint disponível no projeto, se houver.
4. Confirme que o comportamento segue as convenções do projeto:
   - arquitetura em camadas no backend;
   - comunicação HTTP via `/api` no frontend;
   - armazenamento estritamente local em `backend/storage`;
   - metadados mantidos em memória.

Não altere o código durante esta validação. Ao final, informe:

- resultados dos testes ou builds executados;
- falhas encontradas e sua causa provável;
- arquivos alterados relevantes;
- qualquer risco ou lacuna de cobertura que permaneça.
