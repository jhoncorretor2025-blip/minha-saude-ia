## V7.41 — Correção dos candidatos a cônjuge
- 💍 O seletor exclui Pai/Mãe como candidatos a cônjuge e reconhece parentescos femininos como Tia, Avó, Irmã, Prima, Esposa e Companheira para perfis masculinos (e equivalentes masculinos para perfis femininos).
- 🔗 O vínculo já salvo continua disponível para revisão.
- 🔄 Atualização de versão e cache para V7.41.

## V7.40 — Filtro de cônjuge por sexo cadastrado
- 💍 Ao editar um familiar, a lista de “Cônjuge / pessoa vinculada” prioriza pessoas do sexo oposto ao perfil atual: homens veem mulheres e mulheres veem homens.
- 🧾 Se o sexo não estiver informado, a lista não é restringida. O vínculo já selecionado continua visível para permitir revisão sem perder o cadastro existente.
- 🔄 Atualização de versão e cache para V7.40.

## V7.39 — Vínculos inteligentes e verificador familiar
- 💍 Cadastro de cônjuge com vínculo recíproco nos dois perfis; se a pessoa escolhida já estiver vinculada a outro cadastro, o sistema pede confirmação antes de substituir a relação.
- 🧭 Novo verificador de vínculos familiares: identifica parentesco ausente, lado da família não informado, tio/tia por afinidade sem cônjuge, vínculo quebrado ou não recíproco e possíveis nomes duplicados.
- 🔎 Cada alerta oferece atalho para abrir o cadastro correspondente. A revisão não altera dados automaticamente.
- 🔄 Atualização de versão e cache para V7.39.

## V7.27 — Família em abas
- 🗂️ A página Família (que tinha ~7.000 px de rolagem) foi separada em 4 abas fixas no topo: 👥 Pessoas · ➕ Adicionar · 🧬 Saúde da família (histórico e padrões familiares, família com IA) · 💑 Cônjuge (compartilhar e cuidado a dois).
- 📋 A ficha da pessoa também ganhou sub-abas: Dados · Saúde · Remédios · Consultas · Ocorrências · Histórico.
- 🔗 Atalhos levam à parte certa: “💑 Compartilhar” abre a aba Cônjuge e “✏️ Editar perfil” abre Pessoas → Dados. A última aba usada fica lembrada.
- 📏 Resultado no celular: de ~6.900 px para ~1.800–2.800 px por aba.
- 🔄 Versão e cache atualizados para V7.27.

## V7.26 — Compartilhar “Tudo o que eu preenchi”
- 🩺 Na janela de compartilhar, escolha “📋 Só o básico” ou “🩺 Tudo o que preenchi”: entram também álcool, fumo, sono, academia, água, trabalho, alergias, doenças, cirurgias, suplementos, contato de emergência, saúde íntima/prevenção (se preenchidos) e os remédios em uso. Consultas, exames e sintomas continuam de fora.
- 📥 Quem recebe o arquivo importa tudo isso na Família (doenças, alergias, contato, remédios e observações), sem duplicar remédios ao atualizar.
- 🔒 Aviso de privacidade no modo completo; a escolha fica lembrada.
- 🔄 Versão e cache atualizados para V7.26.

## V7.25 — “Baixar meus dados” sempre do titular
- 🐞 Com um familiar selecionado (ex.: o pai), “Compartilhar meus dados básicos” baixava os dados do familiar. Agora usa sempre o perfil e as medidas do titular, mesmo com outra pessoa aberta.
- 🔄 Versão e cache atualizados para V7.25.

## V7.24 — Fim da tela preta
- 🐞 Tela preta ao compartilhar: a janela “Compartilhar meus dados básicos” e o tour “Primeiros passos” eram criados como <section>, e o app esconde toda seção que não é a página aberta — só o fundo escuro aparecia. Agora só as páginas (filhas diretas do conteúdo) ficam escondidas; blocos internos e janelas aparecem normalmente.
- 🐞 Com a mesma correção voltam a aparecer: “Cuidado a dois” na página Família e o lembrete de completar o perfil do tour.
- 🐞 Primeiros passos: uma chave apagada na V7.14 travava o arquivo inteiro (erro de código ao abrir o app).
- 🐞 Cuidado a dois: expressão com “n/a” sem escape travava o arquivo inteiro.
- 🧪 Verificado: as 43 páginas abrem uma de cada vez, o tour passa pelos 4 passos, compartilhar baixa o arquivo, “Começar a compartilhar” e emergência funcionam, sem erros de código.
- 🔄 Versão sincronizada em V7.24 (a constante e o version.json estavam em V7.13 enquanto o site mostrava V7.23).

## V7.13 — Botão “Prompt: pedir só o que falta” no Início
- 🧩 O botão ao lado de “Me ajude a escolher” abre a janela no próprio Início com o prompt do app: pede só os campos vazios e os itens incompletos (o que já está preenchido não é perguntado de novo).
- 🤖📓 Escolha ChatGPT/Gemini ou NotebookLM na janela (o NotebookLM usa o prompt enxuto; se precisar de partes, avisa e leva para a página com todas).
- 🔗 Botões para abrir ChatGPT, Gemini e NotebookLM e link para “Preencher com a IA” para colar a resposta.
- 🐞 Havia duas versões do botão (uma genérica que pedia para a IA descobrir o que faltava e outra que saía do Início): agora é uma só.
- 🔄 Versão sincronizada em V7.13 (a constante e o cache estavam em V7.11 enquanto o site mostrava V7.12).

## V7.11 — Atalho na Home para gerar prompt só com pendências
- 🧩 Adicionado ao card “✨ Comece por aqui”, ao lado de “🤖 Me ajude a escolher”, o botão “Prompt: pedir só o que falta”.
- 📋 O botão usa o perfil ativo e gera o prompt com os campos pendentes já detectados pelo gerador, sem solicitar novamente o que está preenchido.
- 🔀 Respeita o modo padrão ou NotebookLM já selecionado; quando o NotebookLM dividir o prompt, orienta a usar os botões das partes.
- 🧭 Depois de gerar, abre “Importar com IA” e rola até o prompt/status para facilitar copiar e enviar.
- 🎨 Estilo responsivo, foco visível e suporte ao tema escuro.
- 🔄 Versão e cache sincronizados em V7.11.

## V7.10 — Correção da seleção de familiar
- 🧭 A seleção de pessoa valida se o familiar ainda existe e confirma que o perfil ativo foi gravado.
- 🛡️ Se o armazenamento falhar, o seletor permanece aberto e mostra um aviso em vez de fechar sem trocar o perfil.
- ⚡ A troca fecha o modal antes de atualizar a interface; os módulos são atualizados em etapas protegidas para evitar congelamento por falha de renderização.
- 🖱️ Reforçadas as camadas e a área clicável dos cartões de seleção.
- 🔄 HTML, scripts, versão e service worker sincronizados em V7.10.

## V7.09 — Contraste do fundo das doenças na carteirinha
- 🎨 Fundo do bloco de doenças alterado para azul-marinho/roxo escuro translúcido, com detalhe amarelo para destacar a seção no degradê azul-roxo.
- 🏷️ Etiquetas em fundo claro com texto azul-escuro, contraste reforçado com seletores específicos e prioridades contra estilos globais.
- 👁️ Correção para impedir que nomes das condições fiquem invisíveis por herança de estilos de spans.
- 🖨️ Cores preservadas para impressão/PDF e layout responsivo mantido.
- 🔄 HTML, CSS, scripts, service worker e versão sincronizados em V7.09.

## V7.08 — Destaque visual das doenças na carteirinha
- 🩺 O bloco de doenças/condições ganhou destaque de largura total, contraste mais alto e borda de acento.
- 🏷️ Cada condição é exibida em uma etiqueta separada, com um contador que mostra a quantidade cadastrada.
- 📱 Os rótulos quebram em várias linhas no celular para evitar texto espremido ou transbordamento.
- 🖨️ O destaque é preservado na impressão/PDF.
- 🔄 Versão e cache sincronizados em V7.08.

## V7.07 — Página de importação mais fácil
- 🔢 Passo a passo (Preparar → Conversar → Colar → Revisar → Salvar) no topo da importação, avançando sozinho e marcando em verde as etapas feitas.
- 📋 Botão “Colar resposta da IA” (puxa da área de transferência) e “Limpar caixa”.
- 🧹 Limpeza automática da resposta: tira saudação (“Claro! Aqui está…”), asteriscos, blocos de código, marcadores e despedidas.
- 👀 Prévia instantânea ao colar: “✅ Encontrei: 👤 dados pessoais · 💊 remédios · 🩺 consultas · 🧪 exames…” ou aviso se nada foi reconhecido.
- 💾 Rascunho: a recuperação que já existia passa a guardar a resposta limpa e é apagada depois de salvar.
- 🕐 Histórico das últimas importações (data, modo e o que entrou/foi completado), separado por perfil.
- 🎨 Página mais limpa: a importação vem primeiro; as perguntas rápidas ficam num bloco recolhido no fim.
- 🔄 Versão e cache atualizados para V7.07.

## V7.06 — Prompt pede só o que está vazio ou incompleto
- 🧠 Além de pular os campos já preenchidos (nome, nascimento, sexo, sangue, altura, peso, alergias…), o prompt agora lista o que está INCOMPLETO no app — remédio sem dose/frequência, consulta sem especialidade/motivo, exame sem resultado — e pede para a IA completar só isso (ChatGPT/Gemini e NotebookLM).
- 📓 NotebookLM: remédios, consultas e exames voltam a ser perguntados quando há itens incompletos (antes, com 1 remédio cadastrado, a pergunta sumia).
- 📋 Formato das listas indicado no prompt (Nome - dose - frequência; DD/MM/AAAA - Especialidade - Motivo - Orientação; Nome (data): resultado).
- 🔄 Importação completa o registro existente em vez de duplicar: na revisão aparece “✅ Completar o registro existente” já marcado quando a IA trouxe o que faltava.
- 🐞 Leitura da resposta: remédio separa nome, dose e frequência; consulta separa especialidade, motivo e orientação; exame não usa mais o próprio nome como resultado.
- 🔄 Versão e cache atualizados para V7.06.

## V7.05 — Prompt do NotebookLM otimizado
- 📓 NotebookLM: prompt novo, enxuto (a base de dados é o próprio notebook): com todos os campos que faltam ficou com cerca de 1.700 caracteres (antes ~3.800 e, em perfis grandes, campos eram cortados).
- ✂️ Se passar do limite, o app divide em partes (Parte 1, 2, 3…) agrupadas por assunto, sem perder nem repetir nenhum campo; botões “Copiar parte” com ✅ e instruções para colar todas as respostas juntas na importação.
- ⚙️ Limite do NotebookLM ajustável na tela (padrão 3.849 caracteres) e botão “📓 Abrir NotebookLM”.
- 👨 Perfil masculino: ciclo menstrual, gestação, preventivo e mamografia saem dos prompts (NotebookLM e ChatGPT/Gemini).
- 🧭 A página “Preencher com a IA” abre com a importação à mostra; o seletor ChatGPT/NotebookLM saiu da parte recolhida.
- 🔄 Versão e cache atualizados para V7.05.

## V7.04 — Painel visível, relatório com dados certos, adesão aos remédios e importação que salva
- 📊 “Meu painel de saúde” virou uma página de verdade (antes ficava escondido: o app oculta toda seção que não está aberta), com botão no Início e nos menus.
- 🧪 Painel e tendências: açúcar lido do campo correto (glic), dor vinda dos sintomas e gráfico de pressão (máxima).
- 🧾 Relatório evolutivo e “Copiar para IA”: pressão 12/8 sai como 120/80 mmHg (antes virava “128”), sintomas com local/intensidade, consultas com especialidade/médico/orientação e seção “Antes × agora” dos últimos 90 dias.
- 💊 “Remédios: como está indo”: adesão por remédio nos últimos 7 dias, dias em verde/vermelho, dose de hoje pendente e dias sem registro.
- 🐞 Importação: a função que grava os dados tinha sido apagada na V5.97 (mostrava “concluída” sem salvar). Restaurada, preservando o que já estava preenchido.
- 🐞 Revisão da importação: não perde mais os remédios, a especialidade/motivo das consultas nem os dados pessoais.
- 🔄 Versão e cache atualizados para V7.04.

## V7.03 — Campos preenchidos omitidos sem perda de dados
- 🧠 Os modos padrão e NotebookLM omitem campos já preenchidos no perfil e removem linhas duplicadas do resumo do perfil.
- 📓 O modo NotebookLM continua respeitando o limite de 3.849 caracteres; o modo padrão permanece completo até seu limite de segurança.
- 🛡️ A importação valida a resposta primeiro e, antes de salvar, preserva campos atuais quando a IA não os devolve e mantém categorias de histórico que foram omitidas.
- 📝 A tela de revisão informa que campos e categorias omitidos são mantidos no perfil atual.
- 🔄 Versão e cache atualizados para V7.03.

## V7.02 — Prompt inteligente com campos pendentes
- 🧠 O prompt normal e o modo NotebookLM agora omitem campos já preenchidos no perfil (por exemplo, nome, data de nascimento/idade, sexo, altura, peso, condições e registros existentes).
- 📋 O contexto instrui a IA a devolver somente os campos pendentes; campos omitidos devem permanecer como estão.
- 🔢 O contador continua mostrando o tamanho do prompt; o modo NotebookLM mantém o limite de 3.849 caracteres.
- 🛡️ Na confirmação da importação, campos de perfil ausentes/“Não informado” não substituem valores atuais; categorias de histórico omitidas preservam os registros existentes.
- 🔄 Versão, cache e scripts sincronizados em V7.02.

## V7.01 — Seletor de modo e contador do prompt
- 🔢 Exibe a contagem de caracteres do prompt padrão assim que a página é carregada.
- ☑️ Adiciona a opção “Modo NotebookLM”; marcada, gera o prompt compacto com teto de 3.849 caracteres; desmarcada, retorna ao prompt padrão.
- 📋 Os botões de copiar, abrir a IA e atualizar o prompt respeitam a opção selecionada.
- 🩺 No modo NotebookLM, preserva as condições encontradas e reduz primeiro o resumo complementar para caber no limite. Se não for possível preservar a lista de condições, não copia um prompt incompleto.
- 🔄 Versão e cache sincronizados em V7.01.

## V7.00 — Botão dedicado para NotebookLM
- 📓 Adicionado o botão “Gerar e copiar prompt para NotebookLM”, com limite rígido de 3.600 caracteres (abaixo dos 3.849 relatados pelo usuário).
- 🩺 A lista completa de condições cadastradas é priorizada; o sistema reduz primeiro o resumo complementar e depois as informações livres, sem cortar silenciosamente doenças.
- 📋 Mantém a estrutura de campos reconhecida pelo importador. Em perfis excepcionalmente extensos, usa campos essenciais; se nem assim couber a lista de condições, bloqueia a cópia e explica o motivo.
- 🔢 Mostra a contagem de caracteres, as condições preservadas e informa quando algum conteúdo complementar foi reduzido.
- 🔄 Versão e cache sincronizados em V7.00.

## V6.99 — Prompt compacto para NotebookLM
- ✂️ O prompt de importação foi refeito em formato compacto e com limite de segurança de 8.000 caracteres por mensagem.
- 🩺 Prioriza todas as condições encontradas e o campo de informações importantes; reduz apenas o resumo complementar quando necessário.
- 📋 Mantém os 63 campos estruturados da ficha num formato conciso, compatível com o importador do aplicativo.
- 🔢 O status mostra o total de caracteres, o limite e quantas condições foram incluídas.
- 🔄 Versão e cache sincronizados em V6.99.

## V6.98 — Correção do prompt de importação e do menu no desktop
- 🤖 O prompt agora é gerado a partir do perfil ativo, das condições registradas, de informações importantes e do resumo de saúde local.
- 📋 A caixa “Antes de abrir a IA” recebe o mesmo prompt; os botões de copiar e abrir IA regeneram o texto antes de executar a ação.
- 🔎 Foi adicionado o botão “Gerar prompt com meus dados” e um status indicando quantas condições foram identificadas.
- 🔒 Os dados permanecem no navegador e só são copiados/compartilhados quando a pessoa aciona uma ação explícita; a abertura da IA evita colocar dados de saúde na URL.
- 🖥️ Corrigido o estilo do menu completo quando aberto em tela de computador.
- 🔄 Versão e cache sincronizados em V6.98.

## V6.97 — Validação final do contexto de saúde no prompt
- 🩺 Condições cadastradas e o campo “Informações importantes” são colocados no início do prompt para reduzir omissões quando o resumo completo ultrapassa o limite do link.
- 🔎 O prompt consolida as condições do perfil e dos registros de saúde disponíveis; as condições não são fixadas como texto no código público.
- 🧪 Validada a montagem do prompt em um teste com várias condições, incluindo a preservação de quebras de linha reais e do contexto prioritário.
- 🔄 Cache e versão sincronizados em V6.97.

## V6.96 — Contexto completo e prioritário no prompt de saúde
- 🩺 O prompt consolida condições de saúde dos campos do perfil e dos registros médicos disponíveis.
- 📌 As condições e o campo “Informações importantes” são colocados no início da pergunta enviada à IA, reduzindo o risco de serem cortados quando o link precisa ser encurtado.
- 🔒 As condições são lidas dinamicamente do perfil local; dados pessoais de saúde não ficam fixos no código da página.
- 🛡️ Regras do prompt instruem a IA a considerar todas as condições sem tratar relatos como novos diagnósticos nem presumir causalidade.
- 🔄 Versão, cache e metadados sincronizados em V6.96.

## V6.95 — Prompt de perguntas sobre saúde com condições completas
- 🩺 O prompt de “Perguntas sobre minha saúde” agora inclui uma lista consolidada das condições cadastradas no perfil e das condições relatadas explicitamente pelo usuário.
- ✅ Consolida condições cadastradas e informações importantes do perfil, sem embutir dados pessoais de saúde no código público.
- 📌 A lista de condições aparece no início do prompt para não ser perdida quando o link do ChatGPT precisar encurtar o restante do resumo.
- 🔒 As condições específicas do usuário só entram no fluxo do perfil próprio; não são acrescentadas ao prompt de familiares.
- 🔄 Versão, cache e metadados sincronizados em V6.95.

## V6.94 — Contador e hashtags de doenças
- 🔢 O painel Minhas doenças passa a mostrar a quantidade de condições cadastradas no perfil ativo.
- #️⃣ Cada doença recebe uma hashtag curta; tocar na hashtag filtra a lista para essa condição e “#Todas” restaura a lista completa.
- 📱 Hashtags e contador responsivos para desktop e celular, com contraste adaptado ao tema escuro.
- 🔄 Versão e cache sincronizados em V6.94.

## V6.93 — Perguntas para a próxima consulta
- 🗒️ Nova área dentro de Minhas doenças para anotar dúvidas durante a semana e organizar perguntas para a próxima consulta.
- 💡 Sugestões rápidas por assunto: diagnóstico, sintomas, medicamentos, exames, sinais de alerta e retorno.
- ✅ Permite marcar perguntas como discutidas, excluir e copiar somente as pendentes.
- 🔐 As perguntas ficam separadas por perfil de saúde no armazenamento local deste navegador.
- 🔄 Versão, cache, scripts e metadados sincronizados em V6.93.

## V6.92 — Melhorias da Linha do Tempo e Minhas doenças
- 🎨 Cards de doenças com cores sutis por categoria, ícones coloridos, badges de origem e aviso visual para datas pendentes.
- 🔎 Filtro rápido para registros que precisam de revisão ou estão sem data, com busca e sugestões enquanto digita.
- ✏️ Edição inline de data e informação principal em registros compatíveis, sem abrir outra tela.
- 📄 Exportação da linha do tempo para CSV e relatório imprimível/salvável em PDF pelo navegador.
- 🐛 Correção: vírgulas decimais (como “1,0 cm”) deixam de dividir incorretamente nomes de condições.
- 🔄 Versão, parâmetros de cache e service worker sincronizados em V6.92.

## V6.91 — Correção do botão Minhas doenças na Linha do Tempo
- 🩺 O atalho “Minhas doenças” agora fica em uma faixa própria, fora da área de filtros que é recriada pelo aplicativo.
- 🔄 Atualização dos parâmetros de cache, versão e service worker para carregar a correção publicada.

## V6.71 — Cartão do perfil no topo, arrumado
- 👤 O cartão do perfil (nome, idade, peso, altura, tipo sanguíneo) fica logo abaixo do cabeçalho, como o primeiro do Início.
- 🐞 No celular o nome ficava com largura zero e os botões “Editar” e “Ver carteirinha” por cima dos dados: agora são foto + dados lado a lado e os botões numa linha embaixo.
- 🐞 O atalho “Pergunte à IA” entrava dentro do cartão do perfil e espremia tudo: agora fica fora dele.
- 🐞 A regra “#home{display:flex}” fazia o Início aparecer embaixo de todas as outras páginas: agora vale só quando o Início está aberto.
- 👋 A saudação do horário (“🌤️ Boa tarde!”) vai para o próprio cartão, sem um bloco repetido; os 4 botões repetidos saem porque o Início já tem “O que você quer fazer?”.
- 🔄 Versão sincronizada em V6.71 (o version.json estava em V6.64, a constante em V6.65 e o cache em v6-64 enquanto a página mostrava V6.70).

## V6.64 — Visual mais claro
- 🌈 Cor fixa por tipo: sintomas laranja, remédios azul, consultas verde, pressão/açúcar vermelho, exames roxo e lembretes azul-piscina (borda dos cards, títulos e botões do Início).
- 🟢🟡🔴 Semáforo nas medições (pressão, açúcar, batimentos, oxigênio e temperatura) com legenda e aviso de que são valores de referência gerais; barra colorida de intensidade nos sintomas.
- 👋 Saudação no Início com nome, período do dia e data.
- 💊 Ícone do formato do remédio (comprimido, gotas, xarope, injeção, pomada, inalação, sachê): reconhecido pelo nome/dose e ajustável num toque (guardado à parte, sem mexer nos registros).
- 🪪 Carteirinha com cara de cartão: degradê, iniciais grandes e tipo sanguíneo em destaque.
- 📭 Telas vazias amigáveis, com emoji, explicação e botão “➕ Anotar agora”.
- 🐞 Corrigido: a lista de medições (pressão, açúcar…), lembretes e vacinas nunca aparecia — a função que monta essa página não era chamada.
- 🔄 Versão e cache atualizados para V6.64.

## V6.63 — Aviso do remédio, resumo para o médico, link para a família e anotar falando
- 🔔 Aviso na hora de cada remédio da rotina com os botões “✅ Tomei” e “⏰ Lembrar em 15 min” (na notificação do celular e dentro do app). O cartão “Hoje” convida a ativar os avisos.
- 🗓️ “Resumo para levar ao médico”: 1 página com tudo desde a última consulta (sintomas, remédios em uso e novos, pressão/açúcar, exames, alergias, condições) e as perguntas sugeridas, pronta para imprimir ou salvar em PDF.
- 👀 “Link para a família acompanhar”: resumo só leitura (remédios tomados hoje e na semana, sintomas dos últimos 7 dias, medições e próximas consultas). Os dados vão dentro do próprio link, não passam por servidor, e mostram a situação do momento.
- 🎙️ Anotar falando: no sintoma (“dor de cabeça forte desde ontem” → Cabeça · 7/10 · desde ontem, com confirmação antes de salvar) e botão 🎙️ Falar nos campos de texto de sintomas e consultas.
- 🔄 Versão e cache atualizados para V6.63 (o service worker passa a tratar os botões do aviso).

## V6.62 — Mais fácil para quem não tem prática com tecnologia
- 🏠 Início com 4 botões grandes: Anotar como estou me sentindo, Meus remédios, Minhas consultas e Minha carteirinha.
- 📅 “Hoje”: remédios da rotina com horário (marcar como tomado num toque), consultas de hoje/amanhã e lembretes do dia.
- 🔙 Barra fixa no topo de todas as telas: ← Voltar, “Você está em”, 🌙 Tema, ❓ ajuda e 🆘 Emergência (abre o modo emergência com alergias, tipo sanguíneo e remédios).
- 👨‍👩‍👧 “Estou cuidando da saúde de: Eu ▾”: troca entre os perfis locais (mãe, pai…) num toque.
- 🗂️ Menu do computador com 4 opções (Minha saúde, ➕ Anotar, Família, ☰ Mais) — o menu completo continua no ☰ Mais.
- ❓ Botão “?” explica cada tela em linguagem simples e liga 🔠 letra maior e 🌗 cores mais fortes.
- 🗣️ Palavras do dia a dia: Sinais vitais → Pressão, açúcar e batimentos; Exportar → Guardar ou enviar minha ficha; Backup → Cópia de segurança; FHIR em “Avançado”.
- 🧩 Anotar sintoma em 3 passos (onde, de 0 a 10, desde quando), usando o formulário que já existia; depois sugere perguntar à IA.
- 🐞 A barra do topo não grudava (overflow-x:hidden no body); o atalho flutuante de perguntas e o botão Tema ficavam por cima do conteúdo.
- 🔄 Versão e cache atualizados para V6.62.

## V6.61 — Navegação mais fácil no celular e convite para compartilhar
- 💬 Barra de baixo do celular ganhou “Perguntar” (abre as Perguntas sobre minha saúde) — 5 botões numa linha só.
- 🤖 No topo das páginas de IA: “O que você quer fazer com a IA?” com 4 caminhos (Perguntar, Preencher minha ficha, Preparar consulta, Enviar minha ficha).
- 📤 Card “Deixe sua família por dentro” no Início, nas Perguntas e em Exportar: ficha em PDF, resumo no WhatsApp (com confirmação) e carteirinha, com lembrete após 30 dias sem compartilhar.
- 🧭 Menu do celular: “Perguntar sobre minha saúde” em primeiro na IA e “Enviar minha ficha para a família” em Dados.
- 🐞 Versão sincronizada: o version.json estava em V6.55 e o cache em v6-55 enquanto o app estava em V6.60 — isso fazia aparecer “Nova versão disponível” e recarregar a página.
- 🔄 Versão e cache em V6.61.

## V6.55 — Perguntas da consulta: copiar e imprimir funcionando
- 🐞 “Imprimir / salvar PDF” saía em branco: a regra de impressão da página escondia a caixa das perguntas. Agora abre uma folha só com as perguntas, nome, data e linhas para anotar a resposta do médico.
- 📋 “Copiar perguntas” ficou mais confiável no iPhone (seleção do jeito que o Safari exige) e confirma na própria tela, sem depender de janela de alerta.
- 🔄 Versão e cache atualizados para V6.55.

## V6.54 — “Informações que faltam” mais clara e completa
- 😀 Cada informação pendente ganhou seu emoji (🏥 Cirurgias, 🆘 Contato de emergência, 💉 Vacinas, 🧬 Histórico familiar, 📄 Documentos, 📔 Diário do ciclo…) e cada grupo também (👤 Perfil, 🏃 Rotina, 📋 Histórico, 🗂️ Organização, 🌸 Saúde reprodutiva).
- 🐞 Corrigido: o nome e o “Preencher →” apareciam grudados (ex.: “VacinasPreencher”) porque o botão usava uma classe diferente da que o estilo esperava.
- ➕ A ficha agora também confere: telefone de emergência, tabagismo, consumo de álcool e, para mulheres, preventivo do colo do útero e mamografia.
- 🎯 Itens de Rotina e Saúde reprodutiva levam direto ao campo certo do perfil.
- 🔄 Versão sincronizada em V6.54 (a constante, o version.json e o cache estavam em V6.46 enquanto o site mostrava V6.53).

## V6.41 — Edição do perfil individual
- ✏️ Adicionado formulário visível “Editar dados pessoais” dentro de cada ficha, aberto por padrão para facilitar encontrar o recurso.
- 🧑 Permite alterar nome, relação, sexo, nascimento, idade, tipo sanguíneo, condição principal, alergias, contato e observações.
- 💾 As mudanças salvam no perfil selecionado sem apagar medicamentos, consultas, crises ou outros registros.
- 🧭 A página Meu círculo de saúde agora também explica como editar uma pessoa depois do cadastro.
- 🔢 Atualizados o número de versão e referências de cache para V6.41.

## V6.40 — Gerenciamento de relacionamentos
- 💔 Adicionada opção de encerrar o relacionamento e manter o perfil/histórico de saúde arquivado.
- ↩️ Adicionada opção de reativar um relacionamento encerrado.
- 🗑️ Adicionada opção de excluir permanentemente o perfil do parceiro(a) e todos os registros associados, com confirmação explícita.
- 👥 Criada na página Meu círculo de saúde uma lista separada de relacionamentos ativos e encerrados.
- 🧭 Mantidas as melhorias da importação por IA: instruções para gerar JSON, contagem correta, confirmação persistente e atalho para abrir o perfil importado.
- 🔢 Atualizados os números de versão e cache para V6.40.

## V6.39 — Fluxo de importação da IA mais claro
- 🧭 Explicados os passos para transformar a entrevista da IA em JSON e trazer as informações ao sistema.
- 📝 Melhoradas as instruções do prompt da entrevista para gerar o JSON após a revisão, com um comando de recuperação claro.
- 📥 A tela de importação agora orienta o usuário quando cola somente um resumo em texto, e não um JSON.
- ✅ Corrigido o resumo de sucesso: contagem usa os campos reais retornados pela importação; a confirmação fica visível até clicar em “Ver perfil importado”.
- 👤 Ao abrir o perfil, o sistema navega para a lista e rola até os dados importados.
- ♻️ Atualização do perfil existente agora preserva altura, peso, medidas, rotina e medicamentos/vitaminas relatados.
- 🔢 Atualizado o controle de versão para V6.39.

## V6.38 — Atalho Meu círculo de saúde no menu Família
- 💑 Adicionado o item “Meu círculo de saúde” ao menu Família da navegação dinâmica de desktop.
- 📱 Adicionado o mesmo atalho ao menu de navegação móvel.
- 🧭 Corrigida a localização do atalho: a navegação é reconstruída por js/navigation/menu.js, não pelo menu original no HTML.
- 🔢 Atualizados os números de versão e cache para V6.38.

## V6.37 — Página dedicada ao círculo de saúde
- 💑 Criada a página Meu círculo de saúde para organizar o cadastro e acompanhamento de cônjuge, namorado(a) ou companheiro(a).
- 💬 Reunidos em cartões separados os atalhos para enviar entrevista pelo WhatsApp, preencher manualmente, importar respostas e ver perfis cadastrados.
- 🧭 Adicionado acesso próprio à página no menu Família, com instruções de privacidade e visão geral dos dados que podem ser registrados.
- ♻️ Reutilizadas as funções de cadastro e importação existentes, sem criar um armazenamento paralelo.

## V6.36 — Entrevista de saúde compartilhável por WhatsApp
- 💬 Adicionado botão para copiar uma entrevista guiada que pode ser enviada ao parceiro(a) pelo WhatsApp.
- 🤖 A pessoa cola o texto na própria IA, responde a perguntas uma por vez, revisa o resumo e solicita um JSON final para devolver.
- 📥 O JSON pode ser importado pela função existente de colar resposta da IA; a gravação continua dependendo de confirmação no aplicativo.
- 🩺 Importação de perfil ampliada para reconhecer altura, peso, medidas e rotina quando esses campos vierem no JSON.
- 🔐 Incluídas orientações de consentimento, minimização de dados e opção de pular perguntas.

## V6.35 — Círculo de saúde e perfis de pessoas próximas
- 💞 Ampliadas as opções de relação para cônjuge, namorado(a), companheiro(a), parceiro(a) e ficante na área de pessoas acompanhadas.
- 🩺 Adicionados campos opcionais de altura, peso, medidas corporais, rotina física e medicamentos/vitaminas relatados, no cadastro manual e no perfil individual.
- 🤖 Ampliada a entrevista guiada para incluir informações básicas do perfil de saúde; os dados são salvos localmente no perfil da pessoa.
- 🔐 Reforçadas orientações para registrar dados de saúde de outra pessoa apenas com autorização. Os perfis continuam separados do perfil principal.

## V6.34 — Correção do layout inicial
- 🧭 Corrigido o cartão de perfil da página inicial para manter foto, informações pessoais e botões em colunas estáveis.
- 📐 Impedidos elementos adicionais da área inicial de comprimir os dados do perfil ou criar colunas estreitas.
- 📱 Ajustado o comportamento responsivo para telas menores, com estatísticas e botões reorganizados.

## V6.34 — Pergunta chega pronta no ChatGPT
- 🐞 Corrigido: com o perfil preenchido, o texto ficava grande demais e o ChatGPT abria vazio, sem a pergunta.
- ✂️ Agora só vai para a IA o que foi preenchido (linhas “Não informado” e seções vazias ficam de fora).
- 🔗 O ChatGPT sempre abre com a pergunta já escrita; se o texto passar do limite do link, o resumo é encurtado e o texto completo continua copiado.
- 📋 Para Gemini e outras IAs (que não aceitam pergunta pelo link), aparece uma instrução clara para colar com Ctrl + V.
- 🔄 Versão e cache atualizados para V6.34.

## V6.33 — Mais perguntas sobre a saúde
- 🤒 Nova categoria Sintomas: “O que pode ser esse sintoma?”, quando se preocupar, que especialista procurar e se o sintoma tem relação com algum remédio.
- 🌿 Nova categoria Práticas complementares: “Se você fosse um homeopata, o que me indicaria?”, chás e remédios caseiros seguros e interação de fitoterápicos com os remédios — sempre avisando que não substituem o tratamento e que a homeopatia tem evidência científica fraca.
- 🥗 Mais perguntas de alimentação (cardápio de 1 dia, nutrientes que podem faltar), hábitos (plano de 7 dias, exercícios, estresse e ansiedade), exames (explicar resultados, histórico familiar) e visão geral (resumo de 1 minuto para o médico, IMC).
- 🛡️ Regras da IA ajustadas: possíveis causas aparecem como hipóteses para conversar com o médico, nunca como diagnóstico.
- 🔄 Versão e cache atualizados para V6.33 (26 perguntas prontas).

## V6.32 — Perguntas sobre minha saúde
- 💬 Nova página “Perguntas sobre minha saúde” (menu 🤖 IA e atalho no Início).
- ❓ Perguntas prontas: como está minha saúde, o que levar ao médico, alimentos bons, alimentos a evitar, hidratação, hábitos que faltam, hábitos errados, sono, dúvidas sobre remédios e exames preventivos — e campo para pergunta própria.
- 🤖 O app junta a pergunta com o resumo dos registros e regras de segurança (sem diagnóstico, sem mudar remédios, linguagem simples) e abre a IA escolhida em Configurações → Minhas IAs.
- 🔒 Antes de enviar, mostra o aviso de privacidade e a prévia do texto. Nada é enviado sem o toque da pessoa.
- 🔄 Versão e cache atualizados para V6.32.

## V6.31 — PDF mais fácil de ler e versão sincronizada
- 📄 No PDF, os títulos das seções agora aparecem em destaque e com emoji (👤 Perfil, 💊 Medicamentos, 🩺 Consultas, 🧪 Exames…).
- 🅱️ Os rótulos (Nome, Peso, Dose…) aparecem em negrito, e “Não informado” fica mais discreto para destacar o que foi preenchido.
- 🐞 Corrigidas as expressões que reconheciam títulos e rótulos no PDF (estavam com barras duplicadas e nunca funcionavam).
- 🐞 O PDF e o TXT mostravam “V5.61”; agora usam a versão oficial do aplicativo.
- 🔄 Versão sincronizada em V6.31 em todos os lugares (a constante do app e o cache estavam em V6.27 enquanto o site estava em V6.30, o que fazia o aviso de atualização reaparecer).

## V6.30 — Exportação mais organizada e clara
- 📤 Reorganizada a tela de exportação em grupos: guardar cópia, compartilhar informações e acesso rápido.
- 🧭 Melhoradas as descrições de JSON, TXT, PDF, preparação para IA, compartilhamento controlado e modo emergência.
- 🔒 Destacado o aviso de privacidade para lembrar que arquivos exportados podem conter dados pessoais e de saúde.
- ♻️ Mantidas as funções de exportação existentes; alteração focada na interface e nas orientações.

## V6.29 — Explicação de consanguinidade no histórico familiar
- 🧬 O campo agora pergunta claramente se os pais do familiar são parentes biológicos entre si.
- 💡 Adicionada explicação com exemplo (pais que são primos) e esclarecimento de que não se refere ao parentesco entre o usuário e o familiar.
- ♻️ Mantidos os valores internos existentes para preservar registros já salvos.

## V6.28 — Lado materno e paterno no cadastro familiar
- 🧬 Adicionada a opção **Ambos os lados (materno e paterno)** no campo “Lado da família”.
- 🌳 Familiares marcados como pertencentes a ambos os lados aparecem nos grupos materno e paterno do mapa familiar.
- ♻️ Mantida compatibilidade com registros antigos que usam “Ambos / não sei”.

## V6.27 — Histórico familiar clínico e sugestões no painel
- 🧬 Adicionados grau de parentesco, consanguinidade conhecida, status vivo/falecido, idade aproximada no diagnóstico e causa do falecimento.
- ✏️ Familiares já cadastrados podem editar esses campos sem recriar a ficha ou perder medicamentos, consultas, crises e observações.
- 🔔 O painel inicial sugere conversar com profissional de saúde quando há registro familiar de 1º grau com hipertensão ou diabetes; não é diagnóstico nem avaliação individual de risco.
- 🤖 Os novos campos são incluídos nos resumos copiados e no prompt de IA do familiar.
- 💾 Mantida a chave local existente `msa2_familiares`; nenhuma rotina de migração destrutiva ou exclusão de dados foi adicionada.
- 🔢 Versão e cache sincronizados em V6.27.

## V6.26 — Página inicial começa pelo seu cartão de perfil
- 🪪 Ao entrar, o primeiro item da Home é o cartão do perfil, com a foto e os dados pessoais (idade, peso, altura e tipo sanguíneo).
- 📷 Tocar na foto do cartão abre a escolha de foto; a imagem é reduzida e salva neste navegador, sem criar aviso falso de rascunho.
- ⚡ Logo abaixo do cartão ficam as três ações principais: Completar perfil, Registrar sintoma e Registrar consulta.
- 🧹 O guia “Seu resumo de saúde” deixa de aparecer na Home, e a apresentação longa só aparece para quem ainda não tem nenhum dado.
- 👤 Sem nome cadastrado, o cartão mostra “Complete seu perfil” em vez de “Seu nome”.
- 🎨 O cartão “Próximo passo” da Home, que aparecia solto na página por falta de estilo, ganhou o visual de cartão (com versão para o modo escuro).
- 💾 A mensagem informativa de backup (para quem ainda não tem registros) passou a usar a caixa verde, em vez da laranja de alerta.
- 🔢 Versão visível, constante, `version.json` e cache sincronizados em V6.26.

## V6.25 — Recuperação dos familiares e correção dos cards
- Refeito o módulo familiar a partir da versão estável anterior e reaplicada a opção de lado da família usando eventos seguros.
- Cada familiar pode ser marcado como Materno, Paterno, Outro, Ambos/não sei ou Não informado.
- Mantidas as chaves de armazenamento existentes; nenhum comando de exclusão ou limpeza dos dados locais foi adicionado.
- Versão do aplicativo, arquivos, histórico e cache sincronizados em V6.25.

## V6.24 — Lado materno/paterno nos cards de familiares
- 🧬 Cada card de familiar agora permite escolher diretamente: Não informado, Materno, Paterno, Outro ou Ambos / não sei.
- 💾 A seleção é salva no armazenamento local sem apagar os demais dados do familiar.
- 📋 O lado da família fica visível e editável na lista, inclusive para familiares já cadastrados.
- 📱 Controles adaptados para computador e celular; a edição não abre o detalhe do familiar.
- 🔢 Versão da interface, constantes, cache e `version.json` sincronizados em V6.24.

## V6.23 — Boas-vindas redesenhadas
- ✨ Modal inicial reorganizado em três opções claras, com descrições práticas.
- ⚡ Começo rápido destacado como caminho recomendado, sem obrigar o usuário a preencher tudo.
- 🔒 Aviso de privacidade mais claro sobre armazenamento local e uso de IA externa.
- 📱 Layout responsivo para celular e computador, com botões maiores e melhor leitura.
- ♿ Fechamento por Escape e clique no fundo, mantendo os fluxos existentes de cadastro.
- 🔢 Versão visível, referências de cache e `version.json` sincronizados em V6.23.

## V6.22 — Começo rápido para quem tem pouco tempo
- ⚡ Nova opção “Começo rápido · 1 minuto” na tela de boas-vindas: 6 perguntas (nome, nascimento, alergias, remédios de uso contínuo, condições de saúde e contato de emergência). Todas podem ser puladas, sem foto e sem perguntas íntimas. Os dados são gravados no mesmo formato do perfil completo e dos medicamentos.
- ✨ Na boas-vindas, “Usar com IA” explica “Um clique e a IA responde” e “Perfil completo” informa “Completo, manualmente eu cadastro (leva de 2 a 5 minutos)”.
- 🧭 Depois do começo rápido, a Home mostra “Perfil básico pronto” e um único próximo passo, sem a cobrança de “faltam N informações”. Quem pulou ou ainda não começou vê um convite para o Começo rápido.
- 💾 O aviso de backup deixa de aparecer como alerta para quem ainda não tem registros ou começou há menos de 2 dias.
- 👤 Perfil completo: o básico e o contato de emergência aparecem primeiro; foto, remédios para dor, catapora, hábitos de vida, personalização e saúde reprodutiva ficam atrás de “Mostrar mais seções”.
- 📱 Home no celular: o cartão do perfil (botões Editar e Ver carteirinha por cima do nome) e o cartão “O que falta” (texto espremido ao lado do botão) agora se organizam em linhas.
- 🔄 Versão oficial, constante e cache atualizados para V6.22.

## V6.21 — Correção de navegação, estrutura e modo escuro
- 🧭 A página inicial deixou de ficar visível acima das outras páginas: ao abrir Medicamentos, Sintomas, Relatórios e as demais telas, o conteúdo certo aparece no topo.
- 📐 Corrigido um `</div>` a mais que fechava o container principal cedo demais: páginas depois da Linha do tempo encostavam nas bordas da tela e um cartão repetido “Linha do tempo da saúde” aparecia no meio das páginas.
- 🔄 Corrigido o recarregamento automático a cada nova sessão (a verificação de versão comparava com um número antigo fixo).
- 🧹 Removido o texto solto (“\n” e “>”) que aparecia na tela; o `<head>` voltou a ficar completo e uma regra de acessibilidade de movimento reduzido deixou de ser perdida.
- 🩺 O quadro “Identificação do relatório” e o diagnóstico de importação passaram a mostrar a versão real do sistema.
- 🎨 A apresentação da página inicial (introduzida na V6.18) ganhou o estilo que faltava: cartão, três passos lado a lado no computador e empilhados no celular, botões e aviso de privacidade, com versão para o modo escuro.
- 🌙 Modo escuro: títulos, botões e o item ativo da barra inferior que ficavam quase invisíveis passaram a ter contraste legível.
- 🛠️ Removida a chamada a uma função antiga (showOnboarding) que gerava erro ao abrir o aplicativo.
- 🔄 Versão oficial, constante e cache atualizados para V6.21.

## V6.20 — Configurações profissionais, acessibilidade e diagnóstico
- 🔄 Seletor de tema sincronizado com o botão global, evitando opções visuais desatualizadas.
- 👥 Restauração de preferências usa o armazenamento do perfil ativo, preservando o isolamento entre perfis.
- 🎨 Adicionadas opções funcionais de tema, tamanho do texto, alto contraste e redução de animações.
- 💾 Atalhos para as áreas existentes de backup/restauração e exportação, sem duplicar seus fluxos.
- 🔒 Esclarecido que o armazenamento local não representa sincronização automática e que backups de saúde são sensíveis.
- 🧪 Adicionado diagnóstico básico do navegador sem ler ou exibir registros clínicos.
- ↩️ Restaurar aparência ou preferências não apaga o histórico de saúde; as configurações de IA são preservadas na restauração dos módulos.
- 📱 Layout responsivo e controles com confirmação para restauração.
- 🔄 Versão e cache atualizados para V6.20.

## V6.19 — Posicionamento mais claro na página inicial
- 🩺 Apresentação principal atualizada para “Sua caderneta pessoal: o prontuário da sua saúde”.
- 📝 Texto simplificado para explicar que a pessoa registra sintomas, medicamentos, exames, consultas e compromissos de saúde.
- 🔄 Versão oficial, constante e cache atualizados para V6.19.

## V6.18 — Página inicial explica a finalidade do aplicativo
- 👋 Adicionada uma apresentação clara no início: o app organiza o histórico pessoal de saúde, exames, sintomas, medicamentos e consultas.
- 📝 Incluídos três passos simples e atalhos para começar pelo perfil, registrar um sintoma ou preparar uma consulta.
- 🔒 Explicado que os registros ficam no navegador e que o aplicativo não substitui profissionais de saúde nem serve para emergências.
- 📱 Apresentação responsiva para celular e computador, sem remover funcionalidades existentes.
- 🔄 Versão e cache atualizados para V6.18.

## V6.15 — Proteção contra sobrescrita de perfil
- 🛡️ A sincronização agora preserva campos preenchidos quando o outro aplicativo ainda não tem aquele dado.
- 🔄 A primeira sincronização mescla os dados existentes sem apagar informações básicas por campos vazios.
- 🔄 Versão e cache do PWA sincronizados para V6.15.

## V6.14 — Ajustes na sincronização do perfil central
- 🔁 Ao sincronizar familiares, atualiza nome, parentesco, idade e nascimento dos registros existentes sem apagar seus dados clínicos.
- ⚧️ Normalização do gênero entre os formatos usados nos dois aplicativos.
- 🔄 Versão e cache do PWA sincronizados para V6.14.

## V6.13 — Perfil central compartilhado com Canivete
- 🔄 Padronizada a chave local `delta_perfil_central_v1` para nome, idade, nascimento, peso, altura, sexo e familiares resumidos.
- ⚖️ Peso e altura são sincronizados entre os dois apps; o IMC continua calculado por cada módulo com os mesmos valores.
- 👨‍👩‍👧‍👦 Compartilha apenas dados básicos de familiares, sem prontuário, medicamentos, consultas ou exames.
- 🔒 Sincronização local no mesmo navegador/origem; não envia dados para arquivos públicos nem para servidor.
- 🧩 Preservadas as chaves antigas e os registros existentes.

## V6.12 — Notificações remotas via Canivete
- 📲 Exportação de lembretes de medicamentos e compromissos com horário para o motor remoto do Canivete.
- 🔒 Configuração preparada para GitHub Secret; dados de saúde não são gravados em arquivos públicos do repositório.
- 🛡️ Modo discreto padrão para reduzir a exposição de detalhes na tela bloqueada.
- 🔄 Versão e cache do PWA sincronizados para V6.12.

## V6.11 — Integração de despesas médicas com o Canivete
- 💰 Formulário de consulta ganhou valor pago e opção explícita para disponibilizar a despesa ao Canivete.
- 🔗 Cada consulta nova recebe identificador estável para evitar importações duplicadas.
- 🔒 A integração compartilha somente data, especialidade, valor e identificador; motivo, profissional, perguntas e orientações permanecem no Minha Saúde IA.
- 🛡️ Campos financeiros são opcionais; registros antigos e chaves de armazenamento foram preservados.
- 🔄 Versão e cache do PWA sincronizados para V6.11.

## V6.04 — 10/10/2026
- Sincronizada a versão oficial entre a interface, o manifesto de versão, as constantes compartilhadas e o cache do Service Worker.
- Barra de navegação móvel destaca a ação correspondente à seção atual e expõe o estado com `aria-pressed`.
- A indicação acompanha mudanças de seção acionadas por botões internos, mantendo a navegação coerente.
- Preservadas as chaves `msa2_*`, a estrutura dos registros e os fluxos existentes.
- Ajustes limitados à navegação móvel; a disposição desktop foi preservada.

## V6.00 — 08/10/2026
- Reorganização física do JavaScript para uma estrutura por responsabilidade, sem alterar as chaves de armazenamento `msa2_*` nem o formato dos dados.
- `js/app.js` → `js/core/app.js`.
- `js/menu.js` → `js/navigation/menu.js`.
- Recursos → `js/features/`.
- Importação por IA → `js/ai/`.
- Relatórios → `js/reports/`.
- Módulos históricos de melhorias → `js/legacy/`; continuam ativos e não foram removidos do runtime.
- `index.html` e `sw.js` atualizados para os novos caminhos.
- Service Worker/cache e `version.json` sincronizados para V6.00.
- Corrigida uma falha de sintaxe preexistente em `js/features/avancado.js` causada por aspas dentro dos handlers HTML gerados.
- Criado o branch de segurança `backup/antes-refactor-estrutura` apontando para o estado anterior à reorganização.
# V5.85 — Família abre a área de conteúdo

- O botão principal **👨‍👩‍👧 Família** agora abre imediatamente a área de **Histórico Familiar e Genética**.
- A Home deixa de ficar visível ao entrar na categoria Família.
- O submenu continua disponível para escolher **Histórico Familiar e Genética** ou **Familiares**.
- Versão e cache do PWA sincronizados em **V5.85**.

# V5.84 — Família abre no lugar certo

- Ao clicar em **Família > Familiares** ou **Histórico Familiar e Genética**, o aplicativo agora leva a tela diretamente para a seção selecionada.
- Links diretos com `?pagina=familia` e `?pagina=familiares` também posicionam a tela no conteúdo correto.
- Isso evita que a pessoa fique na parte superior do site sem perceber que a página selecionada está mais abaixo.
- Versão e cache do PWA sincronizados em **V5.84**.

# V5.83 — Correção da navegação Família

- Corrigida a abertura das áreas **Histórico Familiar e Genética** e **Familiares** pelo menu.
- O menu passa a navegar diretamente, sem depender da função global de navegação.
- Links com `?pagina=familia` ou `?pagina=familiares` agora abrem na área correta.
- Versão e cache do PWA sincronizados em **V5.83**.

# V5.82 — Família com acesso próprio

- Criada a categoria **Família** no menu desktop.
- Criada a seção **Família** própria no menu mobile.
- **Histórico Familiar e Genética** e **Familiares** agora ficam juntos e fáceis de localizar.
- Mantidas as duas áreas, seus formulários, registros e armazenamento.
- Nenhuma chave de dados locais foi alterada.
- Atualizada a versão/cache para V5.82.

## V5.81 — Fase 2: UX, componentes e responsividade

- 🏠 Refinada a hierarquia visual da Home sem remover funcionalidades.
- 📝 Padronizados visualmente controles, formulários, botões e estados.
- 🖥️ Melhor aproveitamento de telas grandes com grids mais equilibrados.
- 📱 Ajustes mobile para ações, métricas, painéis e área de toque.
- 🧭 Menus receberam limites de altura e rolagem interna para evitar páginas excessivamente longas.
- ♿ Mantidos foco visível, teclado e redução de movimento.
- 💾 Dados locais, chaves de armazenamento e funcionalidades existentes preservados.

V5.81 — 2026-10-01

## V5.80 — Refinamento visual e responsividade

- 🎨 Refinamento visual aditivo baseado no design system existente.
- 🖥️ Melhor aproveitamento de telas grandes sem ampliar excessivamente o conteúdo.
- 📱 Preservados os comportamentos mobile existentes.
- ⌨️ Melhorados estados de foco visível e alvos de toque.
- 🧩 Mantidos dados locais, chaves de armazenamento e funcionalidades existentes.

V5.80 — 2026-10-01

## V5.76 — Inteligência e organização avançadas

- 🧠 **Central de Inteligência:** resumo automático do que está registrado, últimos 30 dias, pendências do perfil e possíveis duplicados.
- 🕐 **Linha do Tempo inteligente:** reúne sintomas, consultas, medicamentos, exames, vacinas, sinais vitais, lembretes, documentos, família, nutrição e sono em uma única visão filtrável.
- 📄 **Leitor inteligente:** leitura local de PDF, imagem e TXT; usa extração de texto e OCR quando necessário e envia o conteúdo somente para a etapa de revisão/importação, sem salvar automaticamente.
- 🔎 **Verificador de Consistência:** identifica datas inválidas/futuras, períodos de medicamento invertidos, retorno de consulta inconsistente e possíveis duplicados.
- 🔒 Os novos recursos são aditivos e não alteram registros existentes automaticamente.
- 🔄 Versão e cache PWA sincronizados para V5.76.

V5.76 — 2026-09-28

## V5.75 — Blindagem da importação

- 🧪 Adicionado autoteste integrado do módulo de importação.
- 🔎 Adicionado botão **🧪 Testar importador** na página de importação.
- 🩺 O autoteste verifica carregamento do módulo, parser de ficha, Markdown, separadores, JSON, validação de entrada vazia e gravação/leitura/remoção temporária.
- 💾 O teste de armazenamento usa somente uma chave temporária e a remove ao terminar.
- 🚨 Falhas do autoteste são exibidas com diagnóstico e código/versão no console e na página.
- 🔄 Mantida a confirmação de gravação existente; nenhuma chave `msa2_*` foi alterada.
- 📄 Documentação de importação atualizada com o procedimento de diagnóstico.
- 🔄 Versão e cache do PWA sincronizados para V5.75.

V5.75 — 2026-09-28

## V5.74 — Importação mais tolerante e inicialização protegida

- 📥 O botão de importação passa a usar uma inicialização protegida que aguarda o módulo carregar antes de executar.
- 🧩 Se o módulo não carregar, a página mostra um diagnóstico em vez de falhar silenciosamente.
- 🤖 A importação aceita marcadores com Markdown, como `**[NOME]**`, listas e cabeçalhos.
- 🔤 Aceita também separadores como `:` e `=` nos marcadores.
- 📦 Respostas JSON podem ser encontradas mesmo quando vêm dentro de bloco Markdown ou acompanhadas de texto antes/depois.
- 🧾 JSON com perfil na raiz passa a ser reconhecido, além do formato `perfil`/`profile`.
- 🛡️ Mantidos o fluxo de revisão, as chaves `msa2_*`, os dados existentes e o caráter local do aplicativo.
- 🔄 Versão e cache do PWA sincronizados para V5.74.

V5.74 — 2026-09-28

## V5.73 — Correção crítica da importação de dados

- 🛠️ Corrigido erro de sintaxe em `js/importacao.js` causado por uma sequência `\\n` literal no meio do código de processamento.
- 📥 O módulo de importação volta a carregar e executar `processarImportacao()` corretamente.
- 🔎 Diagnóstico da importação atualizado para V5.73.
- 🛡️ Mantidos o formato da ficha, as chaves `msa2_*`, o fluxo de revisão e os dados existentes.
- 🔄 Cache do PWA e referências de versão sincronizados para V5.73.

V5.73 — 2026-09-28

## V5.72 — Mapeamento seguro da arquitetura

- 🗺️ Criado `docs/MAPA-MODULOS.md` com o mapa dos módulos, responsabilidades, acoplamentos, repetições, riscos e arquitetura-alvo.
- 🛡️ Nenhum arquivo de runtime foi movido ou removido.
- 💾 Nenhuma chave `msa2_*`, estrutura de dados ou dado local foi alterado.
- 🧩 Definida uma sequência gradual de refatoração para reduzir riscos antes de qualquer reorganização física.
- 🔄 Cache do PWA e `version.json` atualizados para V5.72.

V5.72 — 2026-09-28

## V5.71 — Blindagem contra retorno de código na interface
- Corrigidas todas as referências operacionais antigas V5.67 do index.html.
- Atualizado o cache-busting de CSS/JS para V5.71.
- Adicionada detecção de conteúdo de código contaminando o corpo da página.
- Ao detectar contaminação, o sistema remove registros de Service Worker/cache e recarrega uma URL com cache-buster.
- Sincronizados version.json, sw.js e versão exibida no menu.
- Dados locais e chaves de armazenamento não foram alterados.

V5.71 — 2026-09-28

## V5.70 — Correção crítica dos relatórios

- Corrigido o módulo de relatórios que incorporava indevidamente blocos de **CSS e JavaScript do aplicativo** dentro do HTML gerado.
- Removido o conteúdo contaminante de `openReport()`, evitando que `</script>` encerrasse prematuramente o script principal.
- Mantidos os relatórios completo, médico, sintomas, medicamentos, exames e consultas.
- Atualizada a identificação dos relatórios para V5.70.
- Cache do PWA atualizado para V5.70.
- Nenhum dado ou chave de armazenamento foi alterado.

## V5.69 — Navegação reorganizada por objetivo

- Reorganizado o menu principal para separar tarefas por objetivo: **Início, Registrar, Acompanhar, Organizar, IA e Segurança**.
- **Registrar** concentra sintomas, medicamentos, consultas, exames, sinais vitais, medidas corporais e nutrição.
- **Acompanhar** concentra linha do tempo, sono e bem-estar, histórico familiar, avisos, calendário e lembretes.
- **Organizar** concentra documentos, relatórios e carteirinha.
- **IA** mantém assistente, importação e preparação de consulta.
- **Segurança** concentra exportação/compartilhamento, backup/restauração e configurações.
- Menu mobile reorganizado com seis ações rápidas e categorias por objetivo.
- Mantida a barra inferior mobile com **Início, Registrar, Buscar e Menu**.
- Busca do menu desktop preservada.
- Corrigida a associação dos recursos opcionais no menu mobile para não esconder sinais vitais quando medidas corporais estiverem desativadas.
- Nenhum recurso existente foi removido; a alteração é de organização e acesso.

## V5.68 — Jornada principal e ações rápidas
- 🎯 Adicionado um bloco **Próximo passo** na Home, adaptado ao estado real do cadastro e dos registros.
- ↩️ Importações com rascunho pendente ganham acesso direto para continuar sem perder o trabalho preparado.
- 👤 Perfil incompleto recebe orientação clara para completar os dados essenciais.
- 🚀 Usuário com perfil pronto e sem registros recebe atalho para importar histórico ou fazer o primeiro registro.
- ➕ Ações rápidas foram ampliadas para medidas corporais e alimentação.
- 📱 O menu mobile passa a oferecer mais ações de registro sem criar uma nova área duplicada.
- 🛡️ Alteração aditiva: chaves, formatos de dados e recursos existentes foram preservados.

# Changelog — Minha Saúde IA

## V5.67 — Confirmação dos salvamentos principais
- 🛡️ Sintomas, consultas, medicamentos, exames e medidas corporais agora confirmam o resultado da gravação antes de limpar o formulário.
- ⚠️ Se o armazenamento falhar ou a leitura de confirmação divergir, o sistema informa o problema e mantém os dados digitados.
- 💾 Nenhuma chave ou formato de registro existente foi alterado.
- 📱 Interface, navegação e importação da V5.66 foram preservadas.


## V5.66 — Integridade do armazenamento
- 💾 O núcleo de armazenamento agora confirma a gravação lendo o valor salvo novamente.
- 🛡️ Se houver divergência, tenta restaurar automaticamente o valor anterior.
- 🔒 Mantidos backups locais anteriores e as chaves de armazenamento existentes.
- 📥 As melhorias de importação da V5.65 permanecem ativas.

# Changelog — Minha Saúde IA

## V5.65 — Importação mais segura e clara
- 🛡️ Importação agora valida se informações foram realmente reconhecidas antes de avançar.
- 👀 A etapa de progresso deixa claro que os dados **não são salvos antes da revisão**.
- 📊 A tela informa quantos campos e registros foram reconhecidos.
- ✅ Após a confirmação, o sistema verifica se os principais registros foram gravados.
- 🔎 Diagnóstico de erro atualizado para V5.65.
- 📝 Rascunho da importação continua preservado durante tentativas e cancelamentos.
- 💾 Nenhuma chave de armazenamento existente foi removida ou renomeada.

# Changelog — Minha Saúde IA

## V5.64 — Revisão de UX e dados
- 📅 Próximos cuidados agora mostram somente datas futuras ou de hoje.
- 🧹 Corrigido identificador duplicado na Home que poderia causar comportamento inconsistente no JavaScript.
- 🔄 Referências de cache, scripts e versão atualizadas para V5.64.
- 🛡️ Mantida a estrutura de armazenamento e os recursos existentes.

# Changelog — Minha Saúde IA

## V5.63 — Auditoria funcional e correções
- 🔧 Corrigidas funções visíveis que estavam sem implementação no código atual.
- 📅 Calendário agora possui navegação de mês, botão Hoje e visualização de registros por dia.
- 🔔 Central de avisos agora atualiza e mostra registros futuros identificados.
- ❓ Perguntas para consulta agora permitem adicionar, marcar como respondida/reabrir e excluir.
- 📤 Compartilhamento controlado agora abre, fecha e prepara o conteúdo conforme o nível escolhido.
- 🛡️ Compartilhamento completo só é gerado quando o usuário escolhe explicitamente essa opção.
- 📱 Ajustes preservam a navegação mobile existente.
- 💾 Nenhuma chave de armazenamento existente foi removida.

# Changelog — Minha Saúde IA

## V5.62 — Navegação e organização
- 🧭 Menu desktop agora permite pesquisar funções diretamente.
- ⌨️ Atalho Ctrl+K (ou Cmd+K) foca a busca do menu.
- ↵ Enter abre a primeira função encontrada.
- 📌 Navegação desktop permanece acessível durante a rolagem.
- 📂 Menus longos ganham rolagem própria sem aumentar indefinidamente a página.
- 🔐 O grupo "Mais" foi renomeado para "Dados e segurança" para deixar seu conteúdo mais claro.
- 📱 A navegação mobile existente foi preservada.
- 🛡️ Nenhum recurso existente ou formato de dados foi removido.

# Changelog — Minha Saúde IA

## V5.14 — Assistente visual de importação IA
- 🧭 Criado fluxo visual em 5 etapas: Preparar → Conversar → Colar → Revisar → Salvar.
- 📝 O texto colado é salvo como rascunho local durante a importação.
- 🔄 Rascunho é recuperado automaticamente após retorno à tela.
- ⚠️ Estados de falta de resposta, análise, revisão e conclusão ficaram mais claros.
- ↩️ Cancelar a revisão não apaga o texto da importação, permitindo tentar novamente.
- 🛡️ A confirmação continua sendo necessária antes de salvar os dados importados.


## V5.13 — Importação inteligente, ficha resumida e preparação de consulta
- 💬 Adicionada continuidade conversacional quando a IA faz uma pergunta durante a importação.
- 🔎 Adicionada validação prévia da resposta da IA antes de salvar.
- 🩺 Criada ficha de saúde resumida com cópia para compartilhamento após revisão.
- 👨‍⚕️ Criado modo Preparar consulta com condições, sintomas, medicamentos, exames, consultas anteriores e perguntas para conversar com o profissional.
- 🧩 Recursos novos foram isolados em `js/melhorias-v513.js` para reduzir impacto no núcleo existente.
- 🛡️ Nenhum recurso novo faz diagnóstico ou substitui avaliação profissional.


## V5.12 — Perguntas e doenças na importação IA
- 🩺 A IA agora verifica explicitamente doenças/condições quando essa informação estiver ausente.
- ❓ Pode perguntar: “Quais doenças ou condições de saúde você tem ou já teve?”.
- 🧠 Respostas como “nenhuma” também são preservadas em `[DOENCAS]`.
- 🔎 Parser passou a aceitar várias formas do campo de doenças/condições.
- 🖥️ Guia da tela corrigido para não contradizer o novo fluxo de perguntas.


## V5.11 — API central de armazenamento
- 🧩 `MSAStorage` ganhou `has`, `clear`, `raw` e `setJSON`.
- 💾 `get`, `set` e `remove` continuam compatíveis.
- 🛡️ Nenhuma chave ou formato de dado foi alterado.


## V5.10 — Chaves centralizadas
- 🧩 `melhorias.js` e `recursos.js` usam `MSA_K`.
- 💾 Chaves `msa2_*` existentes foram preservadas.
- 🛡️ Nenhuma migração de dados foi necessária.


## V5.09.1 — Core compartilhado
- 🧩 `app.js`, `melhorias.js` e `recursos.js` passaram a reutilizar `core/utils.js`.
- 🛡️ Mantidos aliases/fallbacks para reduzir risco de quebra.
- 💾 Formato dos dados e chaves de armazenamento não foram alterados.


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

