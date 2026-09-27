# Importação por IA

## Problema que este módulo resolve
Permitir que o usuário copie um prompt para uma IA externa, receba uma ficha organizada e cole essa resposta no Minha Saúde IA para preenchimento automático.

## Contrato de entrada
O formato principal é uma ficha com marcadores:

`[NOME]`
`Jhonatan`

`[DATA_NASCIMENTO]`
`29/10/1988`

Cada marcador representa um campo. O valor pode ocupar uma ou várias linhas.

Também existe suporte para resposta JSON quando a resposta começa com `{`.

## Regras do importador
- Aceitar espaços extras e diferenças de maiúsculas/minúsculas nos marcadores.
- Aceitar bloco Markdown com três crases.
- Não inventar dados.
- Converter datas brasileiras para o formato interno quando necessário.
- Preservar dados já preenchidos quando uma nova importação não trouxer informação confiável.
- Adicionar registros de histórico sem apagar registros anteriores.
- Exibir diagnóstico quando nenhum campo for reconhecido.

## Formato de saída recomendado para a IA
A IA deve devolver somente os campos definidos no prompt, sem explicações antes ou depois. Quando um dado não estiver disponível, usar exatamente **Não informado**.

## Campos
O catálogo completo está documentado no prompt oficial em `prompts/importacao-saude.txt` e no parser de `js/importacao.js`.

## Teste manual mínimo
Testar pelo menos:
1. Resposta completa do ChatGPT.
2. Resposta completa do Gemini.
3. Resposta dentro de bloco ```text.
4. Campos com acentos.
5. Campo multilinha.
6. Resposta com dados parcialmente preenchidos.
7. Resposta inválida/vazia.
