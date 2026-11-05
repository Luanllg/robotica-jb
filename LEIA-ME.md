# Site da Robótica – EE José Bonifácio

## Publicar na Vercel
1. Suba esta pasta para um repositório no GitHub e importe em vercel.com/new (Framework: "Other", sem build).
   Ou, com a CLI: `npx vercel --prod` dentro da pasta.

## Conteúdo dinâmico (Google Planilhas)
1. Crie uma planilha com 3 abas: `Projetos`, `Eventos`, `Noticias`. A linha 1 de cada aba é o cabeçalho:
   - Projetos: titulo | descricao | imagem | alt | autor
   - Eventos: titulo | data | local | descricao | imagem | alt  (data no formato da planilha)
   - Noticias: titulo | texto | imagem | alt
2. Arquivo > Compartilhar > Publicar na web (ou "qualquer pessoa com o link pode ver").
3. Copie o ID da URL (trecho entre /d/ e /edit) para `SHEET_ID` em `js/main.js`.
   Imagens: use endereço direto (https://...) ou arquivos da pasta img/ (ex.: img/foto.jpg).

## Outros ajustes em js/main.js
- `MAPA`: acrescente cidade/endereço da escola.
- `FORM_URL`: endereço do Formspree/Web3Forms para receber mensagens por e-mail (vazio = abre o e-mail do visitante).
- `REDES`: redes sociais da escola, depois de confirmadas com a direção.

## Libras
O tradutor VLibras (governo federal) já vem ativo: aparece o ícone de Libras no canto da tela. Para desligar, use `LIBRAS: false` em `js/main.js`.

## Como lançar um evento na agenda
1. Abra a planilha, aba **Eventos**, e escreva uma nova linha (use o arquivo `planilha-modelo.xlsx` como ponto de partida: importe no Google Planilhas).
2. Preencha: titulo, data (ex.: 05/12/2026), hora (opcional), local, descricao, imagem (endereço direto da foto, opcional), alt (descrição da foto), link (opcional).
3. Salve. Em poucos minutos o evento aparece no site sozinho — não precisa mexer no código.
- Data de hoje em diante: aparece em "Próximos eventos". Data passada: vai para "Eventos realizados".
- Para tirar um evento do site, apague a linha. Apague também a linha de exemplo do modelo.

## Mapa
O mapa abre com o pino da escola no centro. O endereço usado está em `MAPA` e `ENDERECO` (js/main.js); as fontes consultadas divergem no número da rua (124 ou 160), então confirme com a direção.
