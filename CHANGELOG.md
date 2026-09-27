# Changelog — Minha Saúde IA

## V4.61 — Pacote de recursos complementares
- Criado módulo independente `js/recursos.js` para novas funcionalidades.
- Adicionado **Modo Emergência** com nome, tipo sanguíneo, alergias, condições, medicamentos e contato de emergência.
- Adicionada opção de imprimir/salvar o resumo de emergência.
- Adicionado **Cofre de Documentos** para armazenar localmente PDFs, imagens e arquivos pequenos.
- Adicionada abertura e remoção de documentos armazenados localmente.
- Adicionada exportação completa em **JSON estruturado**, facilitando migração para outra IA ou aplicação.
- Mantidos os recursos existentes de backup, PIN, relatórios, timeline, carteira, lembretes e importação IA.
- Corrigido o texto do prompt para não solicitar informações que o usuário não possui.
- Versão atualizada para V4.61 em toda a interface principal.

## V4.60 — Importação de IA mais tolerante
- O importador agora reconhece marcadores com ou sem acentos e pequenas variações de nomes.
- Aceita campos no formato `[CAMPO]`, além de algumas respostas no formato `CAMPO: valor`.
- Tolera listas com marcadores e pequenas diferenças de espaçamento.
- Mantém suporte a JSON e blocos Markdown.
- Normaliza valores como “Não disponível” para “Não informado”.
- Atualiza o diagnóstico interno para V4.60.

## V4.59 — Organização do projeto
- Criada documentação de arquitetura.
- Criada documentação específica do fluxo de importação por IA.
- Criado diretório de prompts com o prompt oficial de importação.
- Preparado o projeto para manutenção mais rápida por novas conversas e outras IAs.
- Corrigida a referência de versão exibida no diagnóstico da importação.

## V4.58
- Redesign visual mobile-first.
- Menus agrupados.
- Correções no carregamento do aplicativo e no fluxo de importação.
