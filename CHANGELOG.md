# Changelog — Minha Saúde IA

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

