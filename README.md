# TrinityCode — Loja Estática (GitHub Pages)

Site de e-commerce 100% estático (HTML + CSS + JS puro), sem servidor, sem Node.js
e sem banco de dados. Todos os dados ficam em arquivos JSON dentro de `data/` e
são carregados automaticamente pelo site.

## Estrutura

```
index.html          → loja (página pública)
admin.html           → painel administrativo (senha)
css/style.css        → estilo da loja
css/admin.css        → estilo do painel
js/utils.js          → funções utilitárias (preço, WhatsApp, JSON, etc.)
js/icons.js          → ícones SVG inline (sem dependências externas)
js/main.js           → lógica da loja
js/admin.js          → lógica do painel (login, CRUD, import/export)
data/produtos.json   → catálogo de produtos
data/banners.json     → banners do topo (hero)
data/categorias.json → categorias do menu
data/configuracoes.json → nome da loja, WhatsApp, redes sociais, senha do admin
images/produtos/      → imagens dos produtos
images/banners/        → imagens dos banners
icons/                 → ícones/placeholders
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `trinitycode-loja`).
2. Envie todos os arquivos desta pasta para o repositório (upload direto ou `git push`).
3. No repositório, vá em **Settings → Pages** e selecione a branch `main` (pasta raiz `/`).
4. Aguarde alguns minutos — o site ficará disponível em
   `https://seu-usuario.github.io/trinitycode-loja/`.

Não é necessário nenhum build, servidor ou passo extra: é tudo HTML/CSS/JS puro.

## Como editar produtos, banners, categorias e configurações

Como o GitHub Pages não permite salvar arquivos diretamente do navegador, o
painel funciona por **importação/edição/exportação**:

1. Acesse `seusite.com/admin.html` e entre com a senha (padrão inicial:
   `trinity2026` — troque isso na aba **Configurações** assim que possível).
2. O painel carrega automaticamente os JSON atuais de `data/`.
3. Adicione, edite ou exclua produtos, banners ou categorias normalmente.
4. Clique em **Exportar** na seção correspondente — isso baixa o arquivo
   `.json` atualizado (ex: `produtos.json`).
5. Substitua o arquivo antigo na pasta `data/` do seu repositório pelo arquivo
   baixado.
6. Faça o commit / push. O site atualiza automaticamente com as novas
   informações.

Se você começar uma sessão de edição em outro computador, use o botão
**Importar JSON** de cada seção para carregar o `produtos.json` (ou
`banners.json`, `categorias.json`, `configuracoes.json`) atual do
repositório antes de continuar editando — assim você não perde nada que já
estava salvo.

## Imagens de produtos e banners

Como o GitHub Pages não aceita upload de arquivo binário pelo navegador, o
fluxo é:

1. No formulário do produto/banner, clique em **"Imagem do produto/banner"**
   e escolha o arquivo — isso só gera uma prévia e preenche automaticamente o
   campo de caminho (ex: `images/produtos/mouse.jpg`).
2. Copie manualmente o arquivo de imagem escolhido para a pasta
   `images/produtos/` (ou `images/banners/`) do seu repositório.
3. Faça o commit. A imagem passará a aparecer no site.

Você também pode simplesmente colar uma URL de imagem já hospedada (ex.: de
um CDN) direto no campo de caminho, sem precisar copiar arquivo nenhum.

## WhatsApp

O botão **Comprar** de cada produto abre uma conversa no WhatsApp com uma
mensagem pronta contendo o nome e o preço do produto. O número usado é o
campo `whatsapp` em `data/configuracoes.json` (edite pela aba
**Configurações** do painel).

## Segurança da senha do admin

Este é um site estático: a senha do painel fica em texto simples dentro de
`configuracoes.json` e a validação acontece no navegador. Isso é suficiente
para impedir que um cliente comum encontre a área administrativa por acaso,
mas **não** é uma proteção contra alguém com conhecimento técnico que
inspecione o código-fonte. Não use este painel para proteger dados sensíveis
— use apenas para gestão de catálogo/conteúdo.

## Personalização visual

As cores, fontes e demais tokens visuais estão centralizados no topo de
`css/style.css` (bloco `:root`), seguindo a paleta:

- `#E86A2C` — laranja (destaque/ação)
- `#3B7DDD` — azul (ação secundária)
- `#18314F` — navy (fundo elevado)
- `#111827` — fundo principal (dark theme)
- `#F8FAFC` — texto principal
- `#CBD5E1` — texto secundário

Fonte de exibição: **Space Grotesk** — Fonte de corpo: **Plus Jakarta Sans**
(carregadas via Google Fonts).
