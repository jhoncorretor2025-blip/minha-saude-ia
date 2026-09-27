# Minha Saúde IA — Arquitetura

## Objetivo
Aplicativo web pessoal para organizar informações de saúde no navegador.

## Estrutura atual
- `index.html` — interface, telas e estrutura visual principal.
- `js/app.js` — estado, armazenamento local, renderização e regras gerais do aplicativo.
- `js/importacao.js` — importação de dados vindos do ChatGPT/Gemini e normalização da ficha.
- `js/menu.js` — navegação e menus.\n- `js/melhorias.js` — busca geral, avisos, calendário, perguntas e compartilhamento controlado.\n- `js/recursos.js` — modo emergência, documentos locais e exportações estruturadas.\n- `manifest.json` + `sw.js` — instalação PWA e cache da interface.
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


## V4.61 — Recursos complementares
O módulo `js/recursos.js` concentra funcionalidades adicionais para evitar que `app.js` cresça desnecessariamente:
- modo emergência;
- exportação JSON estruturada;
- cofre local de documentos;
- abertura e remoção de documentos locais.

Esses recursos funcionam no navegador e não usam chave de API. O armazenamento continua local. Arquivos no cofre têm limite de 2 MB por item para reduzir o risco de esgotar o armazenamento do navegador.


## V4.66 — Isolamento local dos dados
- Dados pessoais pertencem ao **navegador/dispositivo do usuário** e não ficam embutidos na página publicada.
- Não existe banco de dados de saúde, API de armazenamento ou envio automático de dados pessoais.
- O site publicado contém somente código/interface; cada navegador cria e lê seu próprio armazenamento local (localStorage).
- Nunca adicionar dados pessoais reais, perfis de exemplo identificáveis ou fichas de usuário aos arquivos do repositório.
- Se outra pessoa abrir a mesma URL em outro dispositivo/navegador e enxergar dados pessoais, verificar primeiro se ela está usando o mesmo perfil de navegador/dispositivo ou algum mecanismo de compartilhamento do navegador; o GitHub Pages, por si só, não compartilha localStorage entre dispositivos.


## V4.67 — Perfis locais por URL
O aplicativo pode receber `?perfil=IDENTIFICADOR` na URL. Esse identificador cria um namespace separado no armazenamento local do navegador. A função **Link zerado para outra pessoa** gera um identificador aleatório e não copia nenhum dado pessoal para a URL. O link apenas determina qual espaço local será usado.


## V4.68 — Navegação por URL
Cada tela principal pode ser aberta diretamente usando `?pagina=ID`. O parâmetro pode coexistir com `?perfil=IDENTIFICADOR`. A URL contém somente identificadores de navegação; dados pessoais continuam no armazenamento local e nunca devem ser colocados na URL.


## V4.69 — Melhorias de navegação e acompanhamento
O módulo `js/melhorias.js` concentra busca, avisos, calendário e perguntas para consulta. Essas funções leem e gravam somente no armazenamento local do perfil atual.


## V4.71 — PWA e offline
O aplicativo possui manifesto e service worker. O cache é usado para a interface e arquivos estáticos; dados pessoais continuam no armazenamento local do perfil e não são incluídos no cache como conteúdo remoto.


## V4.74 — Diário do sono
O registro principal de sono usa horários de início/fim e calcula a duração. Campos de despertares por urina e dor são armazenados como contagem, sem interpretação clínica automática.


## V4.86 — Design System visual
- `css/design-system.css` é a fundação visual para novos componentes e futuras migrações.
- A folha define tokens (`--msa-*`) e componentes prefixados com `.msa-*`.
- Nesta primeira etapa ela é carregada de forma aditiva; estilos legados permanecem intactos para reduzir risco.
- Migrações visuais devem ser feitas componente por componente e validadas antes da remoção de estilos antigos.

## V4.85 — Núcleo compartilhado e reorganização segura
- `js/core/constants.js` é a fonte compartilhada dos nomes de armazenamento.
- `js/core/storage.js` centraliza leitura, gravação, remoção e migração das chaves legadas.
- `js/core/utils.js` concentra utilidades reutilizáveis.
- Os módulos existentes podem consumir `window.MSA_K`, `window.MSAStorage` e `window.MSAUtils` sem alterar o formato dos dados.
- A reorganização deve continuar em pequenas etapas; não extrair funcionalidades grandes do `app.js` sem validação intermediária.

## V4.84 — Manutenção e navegação
- A **versão oficial** é definida em `version.json`; ao publicar uma alteração funcional, a interface e os parâmetros de cache devem acompanhar essa versão.
- O service worker usa um nome de cache versionado para evitar que arquivos antigos permaneçam ativos após uma atualização.
- O menu **🌸 Ciclo menstrual** é um acesso principal separado e deve continuar condicionado ao perfil feminino pelo comportamento existente.
- A navegação por teclado deve manter foco visível nos controles principais.
- Ao melhorar a interface, priorizar ajustes incrementais em vez de reescrever o aplicativo inteiro.
