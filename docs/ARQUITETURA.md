# Minha Saúde IA — Arquitetura

## Objetivo
Aplicativo web pessoal para organizar informações de saúde no navegador.

## Estrutura atual
- `index.html` — interface, telas e estrutura visual principal.
- `js/app.js` — estado, armazenamento local, renderização e regras gerais do aplicativo.
- `js/importacao.js` — importação de dados vindos do ChatGPT/Gemini e normalização da ficha.
- `js/menu.js` — navegação e menus.
- `version.json` — versão oficial do aplicativo.
- `docs/` — documentação para manutenção e continuidade por pessoas ou IAs.
- `prompts/` — prompts oficiais usados pelo aplicativo.

## Fluxo de importação por IA
1. O aplicativo gera um prompt.
2. O usuário copia o prompt para ChatGPT, Gemini ou outra IA.
3. A IA organiza o contexto disponível em uma ficha estruturada.
4. O usuário copia a resposta da IA.
5. O usuário cola a resposta em **Importar informações**.
6. `js/importacao.js` reconhece o formato, normaliza os campos e salva no armazenamento local.
7. A interface é atualizada.

## Regra importante
A importação deve ser tolerante a pequenas diferenças de formatação produzidas por diferentes IAs. Nunca assumir que ChatGPT e Gemini devolverão exatamente a mesma formatação.

## Armazenamento
Os dados pessoais são armazenados localmente no navegador. O projeto não deve enviar automaticamente os dados pessoais para uma API de IA.

## Manutenção
Antes de alterar funcionalidades:
1. Ler este arquivo.
2. Ler `docs/IMPORTACAO-IA.md` quando a alteração envolver IA/importação.
3. Conferir `version.json`.
4. Incrementar a versão em qualquer alteração funcional.
5. Registrar a alteração no `CHANGELOG.md`.
