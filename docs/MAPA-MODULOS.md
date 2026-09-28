# Mapa de Módulos — Minha Saúde IA

**Versão de referência:** V5.76  
**Objetivo:** documentar a estrutura atual antes de qualquer reorganização física dos arquivos.

> Esta documentação é um mapa de manutenção. Ela não altera a arquitetura em runtime, não move arquivos e não altera chaves ou formatos de armazenamento.

## 1. Visão geral

O projeto é uma aplicação web/PWA **local-first** para organização de informações de saúde. A interface principal continua concentrada em `index.html`, enquanto a lógica foi sendo distribuída gradualmente em arquivos JavaScript.

Fluxo simplificado:

```text
index.html
   │
   ├── core/                → fundamentos compartilhados
   ├── menu.js              → navegação
   ├── app.js               → núcleo da aplicação
   ├── perfil-save.js       → persistência do perfil
   ├── recursos.js          → recursos complementares
   ├── importacao.js        → importação por IA
   ├── melhorias-primeiras.js
   ├── expansoes.js
   ├── importacao-fluxo-v514.js
   └── melhorias-v513.js
```

## 2. Estrutura atual

### Raiz

| Arquivo | Papel |
|---|---|
| `index.html` | Interface principal, markup, estilos/trechos legados e parte importante da lógica atual |
| `manifest.json` | Configuração PWA/instalação |
| `sw.js` | Service Worker, cache e suporte offline |
| `version.json` | Fonte oficial da versão publicada |
| `icon.svg` | Ícone do aplicativo |
| `CHANGELOG.md` | Histórico das alterações |
| `README.md` | Visão geral do projeto |

### CSS

| Arquivo | Papel |
|---|---|
| `css/design-system.css` | Tokens e padrões visuais compartilhados; base para evolução gradual do design |

### Core

| Arquivo | Papel | Regra de segurança |
|---|---|---|
| `js/core/constants.js` | Centraliza chaves e constantes | Não renomear chaves existentes |
| `js/core/storage.js` | Camada de armazenamento e confirmação de gravação | Não alterar formato sem migração explícita |
| `js/core/utils.js` | Funções utilitárias compartilhadas | Manter compatibilidade com consumidores atuais |

### Navegação

| Arquivo | Papel |
|---|---|
| `js/menu.js` | Menu desktop/mobile, navegação por página, busca e organização dos acessos |

### Núcleo da aplicação

| Arquivo | Papel |
|---|---|
| `js/app.js` | Inicialização, estado, formulários, renderização e grande parte das regras da aplicação |
| `js/perfil-save.js` | Salvamento e atualização relacionados ao perfil |
| `js/recursos.js` | Recursos complementares, emergência, documentos e exportações estruturadas |
| `js/avancado.js` | Funções adicionais/avançadas ainda mantidas em arquivo próprio |

### Importação por IA

| Arquivo | Papel |
|---|---|
| `js/importacao.js` | Parser, normalização, revisão e persistência da importação |
| `js/importacao-fluxo-v514.js` | Camada histórica do fluxo visual da importação |
| `prompts/importacao-saude.txt` | Prompt oficial utilizado no processo de importação |
| `docs/IMPORTACAO-IA.md` | Documentação do fluxo e regras da importação |

### Expansões e melhorias

| Arquivo | Papel | Observação |
|---|---|---|
| `js/expansoes.js` | Conjunto grande de funcionalidades adicionadas ao longo do projeto | Principal candidato a divisão futura |
| `js/melhorias.js` | Busca, avisos, calendário e perguntas/recursos complementares | Mistura funcionalidades de acompanhamento e UX |
| `js/melhorias-primeiras.js` | Melhorias adicionadas em etapas anteriores | Arquivo histórico que ainda participa do runtime |
| `js/melhorias-v513.js` | Recursos introduzidos no ciclo V5.13 | Deve ser consolidado somente após mapeamento |
 
## 3. Onde estão os principais acoplamentos

### `index.html`
É o ponto de maior acoplamento porque reúne interface, chamadas inline, partes de lógica e integração de vários scripts.

**Risco:** alterações grandes podem quebrar navegação ou impedir que o navegador interprete o restante do JavaScript.

### `app.js`
Concentra muitas responsabilidades: estado, renderização, formulários e regras gerais.

**Risco:** mudanças em uma área podem afetar outras áreas.

### `expansoes.js`
Funciona como um grande agrupador de recursos que cresceram ao longo do tempo.

**Risco:** difícil localizar responsabilidades e testar mudanças isoladamente.

### `melhorias*.js`
Os nomes refletem a evolução histórica do projeto, não necessariamente a responsabilidade funcional atual.

**Risco:** duplicação de regras e dificuldade para saber qual arquivo é a fonte de determinada função.

### Globais `window.*`
São usadas para manter compatibilidade entre arquivos e com chamadas inline.

**Risco:** colisões de nomes e dependências implícitas.

## 4. Repetições identificadas

1. Diferentes formas de acessar armazenamento apareceram ao longo da evolução do projeto.
2. Muitas funções são expostas globalmente via `window.*`.
3. Há vários pontos de renderização com `innerHTML`.
4. Há chamadas `onclick` inline no HTML.
5. Arquivos de melhorias preservam decisões históricas que poderiam futuramente ser agrupadas por domínio.

Essas repetições **não devem ser removidas em bloco**. Primeiro é necessário identificar consumidores e preservar compatibilidade.

## 5. Arquitetura-alvo gradual

A organização futura pode evoluir para algo próximo de:

```text
js/
├── core/
│   ├── constants.js
│   ├── storage.js
│   ├── utils.js
│   ├── events.js
│   └── version.js
├── navigation/
│   ├── router.js
│   ├── desktop-menu.js
│   └── mobile-menu.js
├── features/
│   ├── perfil.js
│   ├── sintomas.js
│   ├── medicamentos.js
│   ├── consultas.js
│   ├── exames.js
│   ├── sinais-vitais.js
│   ├── medidas.js
│   ├── nutricao.js
│   ├── sono.js
│   ├── documentos.js
│   ├── calendario.js
│   └── lembretes.js
├── ai/
│   ├── importacao.js
│   ├── normalizacao.js
│   └── prompts.js
├── reports/
│   ├── relatorios.js
│   └── impressao.js
├── security/
│   ├── backup.js
│   ├── emergencia.js
│   └── compartilhamento.js
└── integrations/
    └── fhir.js
```

**Importante:** essa é uma arquitetura-alvo, não uma lista de arquivos que devem ser criados imediatamente.

## 6. Ordem segura de reorganização

### Fase 1 — Mapeamento
- Documentar responsabilidades.
- Identificar dependências.
- Não mover arquivos.
- Não alterar dados.

### Fase 2 — Relatórios
Extrair somente a lógica de relatórios do `index.html`, preservando as funções globais necessárias.

### Fase 3 — Versão/cache
Separar gradualmente regras de versão e cache, sem alterar o comportamento do Service Worker.

### Fase 4 — Navegação
Separar roteamento, menu desktop e menu mobile somente depois de mapear as chamadas atuais.

### Fase 5 — Expansões
Dividir `expansoes.js` por domínio funcional, um grupo por vez.

### Fase 6 — Melhorias históricas
Consolidar `melhorias.js`, `melhorias-primeiras.js` e `melhorias-v513.js` por responsabilidade, removendo duplicações apenas após confirmação de equivalência.

### Fase 7 — Núcleo
Reduzir `app.js` por domínio, sempre mantendo uma camada de compatibilidade durante a transição.

## 7. Regras para futuras refatorações

- **Uma mudança estrutural relevante por versão.**
- Incrementar a versão em toda alteração publicada.
- Atualizar `version.json`, cache do PWA e changelog quando necessário.
- Preservar todas as chaves `msa2_*`.
- Não alterar formatos de dados sem migração.
- Não apagar um arquivo histórico até confirmar que nenhum consumidor depende dele.
- Evitar reescrever `index.html` inteiro.
- Evitar migrar tudo para módulos ES de uma vez.
- Depois de cada etapa, fazer auditoria estática de scripts, versões e referências.
- Testes de navegador devem ser tratados separadamente da auditoria de código.

## 8. Princípio de manutenção

> **Preservar → mapear → isolar → verificar → só então remover.**

O objetivo da reorganização não é apenas deixar a árvore de arquivos mais bonita. É reduzir o risco de que uma alteração em uma funcionalidade afete outra e tornar o projeto mais fácil de manter por futuras IAs e desenvolvedores.
