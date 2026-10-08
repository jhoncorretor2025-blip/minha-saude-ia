# 🩺 Minha Saúde IA

Aplicativo web pessoal para organizar informações de saúde de forma simples.

## Estrutura do projeto (V6.00)

```
minha-saude-ia/
├── index.html
├── css/
│   └── design-system.css
├── js/
│   ├── core/
│   │   ├── constants.js
│   │   ├── storage.js
│   │   └── utils.js
│   ├── app.js
│   ├── importacao.js
│   ├── menu.js
│   ├── melhorias.js
│   ├── melhorias-primeiras.js
│   └── recursos.js
├── prompts/
│   └── importacao-saude.txt
├── docs/
│   ├── ARQUITETURA.md
│   └── IMPORTACAO-IA.md
├── version.json
├── CHANGELOG.md
├── manifest.json
├── sw.js
└── icon.svg
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


## V4.61 — Novos recursos
- 🚨 Modo Emergência
- 📄 Cofre local de documentos
- 💾 Exportação JSON estruturada
- 🧩 módulo separado `js/features/recursos.js`

Para manutenção, prefira adicionar funcionalidades novas em módulos separados quando isso evitar alterações desnecessárias em `app.js`.


## V4.71 — Instalação
O projeto possui suporte PWA. Em navegadores compatíveis, a opção de instalar o Minha Saúde IA pode aparecer no menu do navegador. O modo offline é destinado à continuidade da interface e dos registros locais.


## V4.84 — Organização e navegação
- A versão exibida na interface, scripts com cache-busting, verificação de versão e service worker ficam sincronizados.
- O menu **🌸 Ciclo menstrual** permanece independente e agora aparece antes de **🛠️ Ferramentas**.
- A navegação móvel ganhou foco visual mais claro e suporte melhor à área segura de celulares.
- A documentação acompanha os módulos atuais do projeto para facilitar continuidade por outras IAs.


## V4.93 — Primeiras melhorias de confiabilidade
- 📝 Rascunhos automáticos para formulários.
- 🔎 Prevenção de duplicados com confirmação.
- 🗑️ Lixeira reversível para registros principais.
- ✅ Verificador de consistência estrutural.
- 📅 Filtros avançados na linha do tempo.
- 🛠️ Correção de compatibilidade do módulo de melhorias.


## V5.08 — Recursos adicionais
- 🔎 OCR local para imagens do cofre de documentos.
- 🏷️ Etiquetas e filtro de documentos.
- 📱 QR Code do cartão de emergência.
- 🕘 Histórico de alterações sem duplicar conteúdo clínico.
- 🎯 Metas pessoais e painel inicial personalizável.
- 📈 Padrões dos registros e acompanhamento de medicamentos.
- 🤖 Revisão de conflitos na importação por IA.
- 👨‍👩‍👧‍👦 Perfis locais separados.
- 📦 Pacote de transferência entre dispositivos.
- 🔐 Backup criptografado local.
- 🔑 Passkey local opcional.
- ♿ Painel de acessibilidade.
- 📦 Exportação FHIR R4.

**Limitações arquiteturais:** sincronização automática em nuvem, autenticação de conta e armazenamento médico criptografado em repouso ainda exigem uma arquitetura de servidor/backend dedicada.
