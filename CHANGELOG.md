# Changelog — Minha Saúde IA

## V5.08.2 — Estabilidade final
- 🛠️ Corrigido o regex do importador para aceitar `N/A` corretamente.
- 🔎 Corrigidos os fluxos de revisão/conflitos da importação.
- 📦 Exportador FHIR reorganizado para sintaxe e estrutura mais claras.
- 🔄 Versão visual e cache PWA sincronizados.

## V5.08 — Exportação FHIR R4
- 📦 Exporta um Bundle FHIR R4 em JSON.
- 👤 Mapeia perfil e dados pessoais disponíveis.
- 🩺 Mapeia condições, sintomas, sinais vitais, exames, medicamentos, consultas e vacinas.
- ℹ️ O mapeamento é voltado à portabilidade e organização e não representa um perfil clínico institucional validado.


## V5.07 — Painel de acessibilidade
- ♿ Tamanho do texto: 100%, 110%, 125% e 150%.
- 🔆 Maior contraste.
- 📏 Mais espaçamento de leitura.
- 🧘 Redução de animações.
- 💾 Preferências armazenadas neste navegador.


## V5.06 — Passkey local
- 🔑 Cadastro de Passkey com WebAuthn.
- 📱 Opção de usar Passkey para desbloqueio neste navegador.
- ℹ️ Não é login de conta nem sincronização online.


## V5.05 — Backup criptografado
- 🔐 Exportação criptografada com AES-GCM.
- 🧂 Derivação de chave por PBKDF2-SHA-256.
- 🔑 A senha não é armazenada.
- 🛡️ Recurso protege o arquivo exportado; o armazenamento local atual permanece como local-first.


## V5.03 — Perfis locais
- 👨‍👩‍👧‍👦 Gerenciador de perfis separados no navegador.
- 🔗 Links individuais para abrir cada histórico.
- 🔒 Cada perfil usa um namespace de armazenamento independente.


## V5.02 — Conflitos na importação IA
- 🔎 Detecta entradas iguais ou parecidas com registros existentes.
- ✅ Permite manter o atual ou adicionar o importado.
- 👤 Conflitos de campos do perfil também podem ser revisados.


## V5.01 — Acompanhamento de medicamentos
- 💊 Visão de 30 dias por rotina.
- ✅ Contagem de dias com dose registrada.
- ℹ️ Separação explícita entre registro no app e adesão ao tratamento.


## V5.00 — Padrões dos registros
- 📈 Frequências de sintomas por local e tipo.
- 🎯 Frequências de gatilhos informados.
- 📅 Distribuição por dia da semana e horário.
- 🛡️ Sem diagnóstico ou inferência de causa.


## V4.99.1 — Correção da personalização do painel
- 🛠️ Corrigidos os seletores usados para mostrar/ocultar os blocos corretos da página inicial.


## V4.99 — Painel inicial personalizável
- ⚙️ Blocos da página inicial podem ser mostrados/ocultados.
- 🔄 Preferência fica armazenada localmente.
- 🛡️ Nenhum dado de saúde é removido.


## V4.98 — Metas pessoais
- 🎯 Criação de metas locais.
- 📊 Indicadores de completude, água, registros e peso.
- 📱 Acompanhamento visual do progresso.


## V4.97 — Histórico de alterações
- 🕘 Registro local das gravações feitas no aplicativo.
- 🔒 O histórico guarda metadados da alteração, não uma cópia do conteúdo clínico.
- 🧹 Pode ser limpo separadamente dos dados de saúde.


## V4.96 — QR Code de emergência
- 📱 Geração de QR Code para o cartão de emergência.
- 🔒 Conteúdo limitado ao resumo do cartão pessoal.
- 💾 Permite salvar a imagem do QR Code.


## V4.95 — OCR e etiquetas de documentos
- 🔎 OCR opcional para imagens usando processamento no navegador.
- 🏷️ Documentos podem receber etiquetas para organização e filtro.
- 🛡️ Nenhum envio automático do documento para uma IA.


## V4.93 — Correção de compatibilidade
- 🛠️ Restaurada a função de armazenamento usada pelo módulo `js/melhorias.js` no fluxo de perguntas para consulta.
- ✅ Mantidas as funcionalidades adicionadas entre V4.88 e V4.92.
- 🔄 Referências e cache do aplicativo sincronizados para V4.93.


## V4.92 — Filtros da linha do tempo
- 🔎 Busca por texto na visão completa da timeline.
- 🏷️ Filtro por tipo de registro.
- 📅 Filtro por período.
- 🧹 Limpeza rápida dos filtros.
- 🛡️ A prévia da página inicial permanece inalterada.


## V4.91 — Verificador de consistência
- 🔍 Nova área para verificar a organização dos dados.
- 📅 Detecta datas inválidas.
- 🔄 Detecta períodos invertidos em medicamentos e ciclos.
- 🔎 Aponta possíveis duplicados.
- 🔗 Detecta registros de doses sem rotina correspondente.
- 🛡️ Não interpreta exames nem faz diagnóstico.


## V4.90 — Lixeira e restauração
- 🗑️ Registros principais podem ser movidos para uma Lixeira em vez de apagados diretamente.
- ♻️ Itens da Lixeira podem ser restaurados.
- ⚠️ Exclusão definitiva exige confirmação.
- 📦 Aplicado inicialmente a sintomas, consultas, medicamentos e exames.


## V4.89 — Prevenção de duplicados
- 🔎 Antes de salvar, formulários principais verificam se já existe uma entrada igual ou muito parecida.
- ✅ O usuário pode confirmar o salvamento quando o registro repetido for intencional.
- 🛡️ Nenhum registro antigo é alterado automaticamente.


## V4.88 — Rascunhos automáticos
- 📝 Formulários passam a salvar rascunhos localmente enquanto o usuário preenche.
- ↩️ Rascunhos podem ser retomados ou apagados.
- 🛡️ Arquivos e campos de senha não entram no rascunho.
- 🔒 Os rascunhos ficam separados dos registros oficiais.
- 🧩 Alteração aditiva: dados já salvos e seus formatos permanecem iguais.


## V4.87 — 5 melhorias rápidas de UX
- ♿ Pular para o conteúdo e foco mais claro para teclado.
- 📱 Alvos de toque mais confortáveis no mobile.
- 📝 Campos mais legíveis e fáceis de tocar.
- 🔄 Ações responsivas em telas estreitas.
- 🧘 Respeito à preferência `prefers-reduced-motion`.
- 🛡️ Lógica, armazenamento e importação permanecem intactos.


## V4.86 — Fundação visual do Design System
- 🎨 Criado `css/design-system.css` como fonte oficial para novos componentes visuais.
- 🎯 Definidos tokens de cores, tipografia, espaçamentos, raios, sombras e dimensões de controles.
- 🧱 Criados padrões para cabeçalhos, cards, botões, formulários, filtros, listas, estados, feedbacks e modais.
- ♿ Incluído padrão de foco visível para teclado.
- 📱 Incluída base responsiva para telas pequenas.
- 🛡️ Etapa aditiva: os estilos existentes não foram removidos nem substituídos nesta versão.


## V4.85 — Núcleo compartilhado e reorganização segura
- 🧱 Criada a pasta `js/core/` com `constants.js`, `storage.js` e `utils.js`.
- 🔑 Centralizados os nomes das chaves de armazenamento em uma única fonte.
- 💾 Centralizada a leitura, gravação e remoção do armazenamento, preservando a migração de chaves antigas e os backups locais.
- 🧩 `app.js`, `melhorias.js` e `recursos.js` passaram a reutilizar a camada compartilhada.
- 🛡️ Nenhuma mudança no formato dos registros foi feita nesta etapa.
- 🚫 A funcionalidade de importação foi mantida sem refatoração estrutural para reduzir risco.


## V4.84 — Organização e navegação refinadas
- 🧭 **Ciclo menstrual** reposicionado antes de **Ferramentas**, mantendo acesso separado e mais fácil de encontrar.
- 📱 Navegação móvel refinada com melhor destaque do ciclo e respeito à área segura do celular.
- ⌨️ Melhorado o foco visual para navegação por teclado nos menus.
- 🧹 Sincronizadas as referências de versão da interface, scripts e verificação automática: **V4.84**.
- 🚀 Cache do PWA atualizado para acompanhar a nova versão.
- 📝 Documentação da arquitetura e estrutura do projeto atualizada para facilitar manutenção por futuras IAs.


## V4.83 — Linha do tempo mais limpa
- 🧹 Removidos da exibição os placeholders **“valor”**, **“Não informado”**, **“N/A”** e equivalentes.
- 😣 Sintomas com intensidade **0/10** não mostram mais “0/10” como se fosse uma informação relevante.
- 📅 O registro continua aparecendo pela data, mas sem texto artificial quando não há detalhe informado.
- 📈 Sinais vitais e outros registros também evitam mostrar placeholders vazios.
- Versão atualizada para V4.83.


## V4.82 — Guia para iniciantes minimizado
- 🧭 O **Guia para quem nunca usou IA** agora começa minimizado.
- 👆 Um clique expande o passo a passo completo.
- 📄 A página fica mais curta para quem já sabe usar IA.
- 📱 Mantida a adaptação dos passos para celular.
- Versão atualizada para V4.82.


## V4.81 — Guia de importação mais compacto
- 📐 Cards do guia reduzidos para ocupar menos espaço vertical.
- 🖥️ Passos organizados em duas colunas no computador.
- 📱 No celular, os cards voltam automaticamente para uma coluna.
- ✂️ Mantidas as instruções essenciais para usuários iniciantes.
- Versão atualizada para V4.81.


## V4.80 — Importação por IA mais fácil para iniciantes
- 🧭 Adicionado guia visual passo a passo para quem nunca usou IA.
- 📋 Explicado como copiar o prompt e onde colar no ChatGPT/Gemini.
- 💬 Explicado como copiar a resposta completa da IA e colar no aplicativo.
- 🔎 Explicado que a importação mostra uma prévia antes de salvar.
- 🔒 Adicionado aviso claro sobre privacidade e envio voluntário dos dados.
- 🆘 Adicionadas orientações para problemas de colagem/importação.
- Versão atualizada para V4.80.


## V4.79 — Ciclo menstrual contextual por sexo do perfil
- 🌸 O menu **Ciclo menstrual** fica oculto quando o perfil está como **Masculino**.
- 👩 Quando o perfil está como **Feminino**, o menu aparece normalmente.
- 🔄 A visibilidade é atualizada automaticamente ao carregar ou alterar o sexo no perfil.
- Versão atualizada para V4.79.


## V4.78 — Ciclo menstrual com acesso direto
- 🌸 Corrigido o botão principal **Ciclo menstrual**.
- 👉 O botão agora navega diretamente para a área de saúde reprodutiva e posiciona a tela no diário do ciclo.
- 🧩 O ciclo continua separado de Ferramentas e permanece em destaque no menu principal.
- Versão atualizada para V4.78.


## V4.77 — Correção da página de importação/relatórios
- 🛠️ Corrigido um fechamento indevido de `<script>` dentro do gerador de relatórios.
- 🧹 O navegador deixava de interpretar o restante do JavaScript e passava a mostrar código como texto na página.
- 📄 Corrigido o comportamento dos relatórios sem alterar os dados armazenados.
- 🔄 Referências visíveis e cache atualizados para V4.77.

## V4.76 — Ciclo menstrual em destaque
- 🌸 Criado acesso principal e separado para **Ciclo menstrual**.
- 📍 O menu fica ao lado de **Ferramentas**, sem ficar escondido dentro de Perfil.
- 🩸 Acesso direto ao diário, histórico e acompanhamento do ciclo.
- Versão atualizada para V4.76.


## V4.75 — Diário do ciclo menstrual
- 🩸 Adicionado acompanhamento específico do ciclo menstrual.
- 📅 Registro do início e fim de cada menstruação.
- 🩸 Registro opcional de intensidade do fluxo.
- 😣 Registro de cólicas/dor de 0 a 10.
- 📊 Cálculo da média dos intervalos entre os inícios registrados.
- 📅 Estimativa simples do próximo início baseada somente na média dos registros.
- 📝 Observação opcional por ciclo.
- 🔒 Dados permanecem no armazenamento local do navegador.
- A estimativa não é usada para indicar ovulação ou fertilidade.
- Versão atualizada para V4.75.


## V4.74 — Diário do sono simplificado
- Formulário reduzido para registro rápido do sono.
- 🌙 Horário que dormiu.
- ☀️ Horário que acordou.
- ⏱️ Cálculo automático da duração aproximada do sono, inclusive quando passa da meia-noite.
- 🚽 Quantidade de vezes que acordou para urinar.
- 😣 Quantidade de vezes que acordou por dor.
- 📝 Observação opcional.
- Registros antigos de sono continuam sendo exibidos no formato anterior quando encontrados.
- Versão atualizada para V4.74.

## V4.73 — Compartilhamento seguro
- Criado seletor de conteúdo para compartilhamento.
- 🔹 **Apenas completude**: percentual do perfil principal sem ficha clínica.
- 🔹 **Resumo**: quantidades e organização geral, sem listar dados clínicos detalhados.
- ⚠️ **Ficha completa**: exige confirmação explícita antes de compartilhar.
- Usa compartilhamento nativo quando disponível ou copia o conteúdo para a área de transferência.
- Versão atualizada para V4.73.

## V4.71 — Aplicativo instalável e modo offline
- Adicionado `manifest.json` para instalação como aplicativo.
- Adicionado `sw.js` para cache da interface e funcionamento offline básico.
- Adicionado ícone do aplicativo.
- O modo offline armazena somente recursos da aplicação em cache; os dados pessoais continuam no armazenamento local do navegador.
- Nenhum dado de saúde é enviado pelo service worker.
- Versão atualizada para V4.71.

## V4.70 — Medicamentos avançados
- Registro diário de dose para rotinas de medicamentos.
- Evita duplicar a mesma dose no mesmo dia.
- Permite desfazer o registro do dia e repõe o estoque correspondente.
- Indicador de rotinas ativas, doses registradas hoje, registros dos últimos 7 dias e estoque baixo.
- Mantido o caráter de registro: o sistema não avalia se a pessoa tomou corretamente segundo prescrição.
- Versão atualizada para V4.70.

## V4.69 — Busca, avisos, calendário e perguntas
- Criado módulo `js/melhorias.js` para funcionalidades complementares de navegação e acompanhamento.
- 🔎 **Busca geral** em registros de saúde salvos localmente.
- 🔔 **Central de avisos** para próximos cuidados e registros recentes relevantes.
- 📅 **Calendário de saúde** com consultas, exames, vacinas, lembretes e sintomas registrados.
- ❓ **Perguntas para consulta**, com status pendente/respondida.
- Todas as novas informações permanecem no armazenamento local do perfil atual.
- Versão atualizada para V4.69.

## V4.68 — URL individual por página
- Cada seção navegável agora recebe `pagina=...` na URL.
- O botão de navegação atualiza a URL sem recarregar a aplicação.
- O botão Voltar/Avançar do navegador retorna às páginas visitadas.
- Atualizar a página mantém a seção aberta.
- O parâmetro `perfil` continua funcionando junto com `pagina`, mantendo os dados isolados por perfil.
- Nenhum dado de saúde é colocado na URL.
- Versão atualizada para V4.68.

## V4.67 — Link separado para novos usuários
- Adicionado sistema de **perfil local por URL**.
- O link normal continua usando o armazenamento local já existente, preservando os dados do usuário atual.
- Links com `?perfil=...` usam um namespace de armazenamento separado.
- Adicionado botão **🔗 Link zerado para outra pessoa**, que gera um link novo e copia para a área de transferência.
- A pessoa que receber esse link começa com o aplicativo vazio, sem acessar o cadastro local de outro perfil.
- Os dados continuam somente no navegador; o link não envia nem sincroniza dados com servidor.
- Atualizada a documentação de arquitetura.
- Versão atualizada para V4.67.

## V4.66 — Dados locais e isolamento do navegador
- Reforçada a arquitetura **local-first**: os dados pessoais são armazenados no navegador por meio de localStorage.
- Confirmado que o repositório não deve conter dados pessoais reais.
- Atualizados os arquivos de interface e scripts para V4.66.
- Atualizada a documentação para deixar explícito que abrir a mesma URL em outro dispositivo/navegador não deve carregar o armazenamento local de outra pessoa.
- Nenhuma API/banco de dados de saúde foi adicionado.

## V4.65 — Saúde reprodutiva ampliada
- Adicionado campo de **duração média do ciclo**.
- Adicionado campo de **duração média do sangramento**.
- Adicionado **regularidade do ciclo: regular ou irregular**.
- Anticoncepcional agora registra o **método utilizado**.
- Para pílula combinada, permite registrar regime de **21, 24 ou 28 dias**.
- Para minipílula, permite registrar o tipo quando conhecido, incluindo **tradicional** ou **drospirenona**.
- Mantidos nome, horário habitual e data de início.
- Adicionado botão **🚨 Esqueci uma dose**, com orientação de segurança baseada no método cadastrado e aviso para confirmar a bula específica.
- Adicionado acesso ao **Bulário Eletrônico da Anvisa**.
- A completude do sistema passa a considerar informações reprodutivas quando o perfil é feminino.
- Importação por IA atualizada com todos os novos campos.
- O aplicativo não usa uma regra única para todos os anticoncepcionais, porque as orientações de esquecimento podem variar conforme o método e o produto.
- Versão atualizada para V4.65.

## V4.64 — Controle diário de anticoncepcional
- Para perfil **Feminino**, o bloco de saúde reprodutiva agora pergunta se há uso de anticoncepcional diário.
- Permite registrar **nome, horário habitual e data de início**.
- O aplicativo cria um acompanhamento diário com **✅ Tomei** e **❌ Não tomei**.
- Mostra o histórico dos últimos dias para facilitar conferência.
- Quando o horário programado chega, o aplicativo pode exibir um lembrete enquanto estiver aberto; se notificações do navegador estiverem autorizadas, pode usar a notificação do sistema.
- O importador de IA reconhece e importa os dados do anticoncepcional.
- O prompt oficial foi atualizado para solicitar esses dados somente quando estiverem disponíveis, sem criar informações.
- Mantida a orientação de que o recurso é um lembrete/registro e não substitui orientação profissional.
- Versão atualizada para V4.64.

## V4.63 — Menu Complementos
- Criada a nova aba **🧩 Complementos** entre **🩺 Saúde** e **🛠️ Ferramentas**.
- Movidos para Complementos: **🥗 Nutrição**, **😴 Sono e Bem-estar** e **🧬 Histórico familiar**.
- O conteúdo e as funções dessas áreas permanecem os mesmos; foi alterada apenas a organização da navegação.
- Versão atualizada para V4.63.

## V4.62 — Completude do cadastro
- O percentual de preenchimento agora considera o **sistema inteiro**, não apenas os campos básicos do perfil.
- A tela mostra quantos itens estão preenchidos e quantos ainda estão pendentes.
- As pendências são exibidas diretamente na área de progresso.
- Adicionado botão **“Copiar lista do que falta”** para enviar um checklist a outra pessoa.
- O cálculo considera perfil, rotina, histórico clínico e organização.
- Mantida a regra de não inventar informações; campos sem informação ficam pendentes.
- Versão atualizada para V4.62.

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

