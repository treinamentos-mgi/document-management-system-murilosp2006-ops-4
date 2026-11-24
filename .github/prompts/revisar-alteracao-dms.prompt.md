---
description: Revisa uma alteração do DMS com foco em bugs, regressões, arquitetura e testes.
name: revisar-alteracao-dms
argument-hint: área ou arquivos alterados (ex. backend/src/services/document.service.js)
agent: agent
---

# Revisar alteração do DMS

Realize uma revisão técnica somente leitura da alteração em `${input:alvo:arquivos ou area alterada}`.

Antes de concluir:

1. Identifique a alteração real com `git diff` e examine apenas os arquivos relacionados.
2. Leia o código diretamente afetado e os testes ou chamadas próximas.
3. Não modifique arquivos; apenas reporte problemas e lacunas de cobertura.
4. Execute testes locais apenas quando forem necessários para confirmar um achado.

Revise nesta ordem:

- bugs ou regressões comportamentais;
- violações do fluxo `routes -> controllers -> services -> repositories`;
- responsabilidades de cada camada misturadas ou acoplamento indevido;
- falhas em validação, erros HTTP ou leitura/escrita de arquivos;
- armazenamento fora de `backend/storage` ou uso de serviços externos;
- metadados fora da convenção atual de armazenamento em memória;
- testes ausentes para casos de sucesso, erro e borda relevantes;
- mudanças no frontend sem comunicação adequada via `/api`.

Formato da resposta:

- Liste primeiro os achados, do maior para o menor risco.
- Cada achado deve indicar severidade, arquivo e linha, regra violada, impacto e correção recomendada.
- Use somente severidades `CRÍTICO`, `ALTO`, `MÉDIO` ou `BAIXO`.
- Se não houver achados, diga explicitamente que a alteração não apresentou problemas.
- Ao final, inclua um resumo curto e o estado dos testes executados, se houver.
