# 🩺 Minha Saúde IA

Aplicativo web pessoal para organizar informações de saúde de forma simples.

## Estrutura do projeto

```
minha-saude-ia/
├── index.html
├── js/
│   ├── app.js
│   ├── importacao.js
│   └── menu.js
├── prompts/
│   └── importacao-saude.txt
├── docs/
│   ├── ARQUITETURA.md
│   └── IMPORTACAO-IA.md
├── version.json
└── CHANGELOG.md
```

A documentação em `docs/` existe para permitir que outra pessoa ou IA entenda rapidamente a arquitetura antes de alterar o projeto.

## Recursos

- Perfil de saúde
- Registro de dores e sintomas
- Mapa de dor
- Evolução da dor
- Consultas
- Medicamentos
- Exames
- Relatórios
- Backup e restauração em JSON
- Exportação CSV
- Proteção local por PIN
- Importação de informações organizada por IA
- Tela inicial simplificada para começar rapidamente

## Publicação

O projeto pode ser publicado pelo GitHub Pages.

1. Abra **Settings** do repositório.
2. Entre em **Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch **main** e a pasta **/(root)**.
5. Salve.

## Privacidade e segurança

Esta versão é um protótipo que armazena os dados no navegador usando armazenamento local. Não deve ser considerada uma solução de armazenamento médico seguro para produção.

Para uma versão pública/produção, recomenda-se implementar autenticação, criptografia, armazenamento seguro no servidor, política de privacidade e controles adequados de proteção de dados.

A função de importação com IA não envia dados automaticamente para uma IA: o usuário decide o que copiar e colar.

## Aviso

O Minha Saúde IA é uma ferramenta de organização de informações. Não substitui avaliação, diagnóstico, prescrição ou orientação de profissionais de saúde.
