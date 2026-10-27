# Rei do iPhone JP · Landing page

Site estático (HTML, CSS e JavaScript puro, sem framework e sem dependências), pronto para GitHub + Vercel.
Tema glassmorphism preto e branco, dourado só nos detalhes da coroa e do 21X. Fonte do texto: Outfit (auto-hospedada). Logo vetorial reconstruído com os contornos da fonte Moonhouse.

## Estrutura

```
index.html                 página principal (one-page)
404.html                   página de erro personalizada (noindex)
robots.txt / sitemap.xml   SEO
site.webmanifest           ícones e cor do tema
vercel.json                cache e cabeçalhos de segurança
site.config.json           SITE_URL centralizada
scripts/set-site-url.mjs   troca a URL em todos os arquivos
favicon.ico / favicon.svg / apple-touch-icon.png / icon-192.png / icon-512.png / og-image.jpg  (provisórios)
assets/css/styles.css      CSS fonte (editável)   -> styles.min.css (usado no site)
assets/js/main.js          JS fonte (editável)    -> main.min.js (usado no site)
assets/fonts/              Outfit variável (WOFF2)
assets/img/                fotos em AVIF + WebP (vários tamanhos) e logo SVG
assets/video/              vídeos MP4 otimizados (sem áudio, carregam sob demanda)
```

Se editar `styles.css` ou `main.js`, gere os minificados de novo:

```
npx esbuild assets/css/styles.css --minify --outfile=assets/css/styles.min.css
npx esbuild assets/js/main.js --minify --outfile=assets/js/main.min.js
```

## Testar no computador

```
npx serve .
```
Abra o endereço mostrado. (Abrir o `index.html` direto pelo arquivo não funciona, porque os caminhos começam com `/`.)

## O que falta preencher

| Item | Arquivo e linha | O que fazer |
|---|---|---|
| URL do site | `index.html` linhas 8, 18, 26, 28, 35, 64, 66, 67, 68 · `robots.txt` linha 6 · `sitemap.xml` linha 5 · `site.config.json` linha 2 | Depois do deploy, rode `node scripts/set-site-url.mjs https://SEU-PROJETO.vercel.app` (troca tudo de uma vez) |
| Imagem de compartilhamento | `/og-image.jpg` (referenciada em `index.html` linhas 27 e 28) | Opcional: substituir por arte própria 1200x630 px com o mesmo nome. A atual é provisória, feita do logo |
| Favicons | raiz: `favicon.ico` (32x32), `favicon.svg`, `apple-touch-icon.png` (180x180), `icon-192.png`, `icon-512.png` (comentário em `index.html` linha 37) | Opcional: substituir mantendo nomes e tamanhos. Os atuais são provisórios, feitos da coroa |
| Endereço, CEP, horário, mapa | `index.html` linha 83 (bloco comentado do JSON-LD) | Preencher quando tiver: rua e número, CEP, coordenadas e horário de funcionamento |

## Publicar no Vercel via GitHub

1. Crie um repositório no GitHub e envie esta pasta inteira (com `index.html` na raiz).
2. No Vercel: Add New > Project > importe o repositório. Framework Preset: **Other**. Build e Output: deixe vazio. Deploy.
3. Pegue o link de produção em Settings > Domains (formato `seu-projeto.vercel.app`).
4. No projeto, rode `node scripts/set-site-url.mjs https://seu-projeto.vercel.app`, faça commit e push. O Vercel publica de novo sozinho.
5. Confira no link de produção: `/robots.txt`, `/sitemap.xml` e o código-fonte da home (canonical e og:url com o link certo).

Links de preview do Vercel (os que têm hash no nome) ficam com noindex por padrão. Isso é normal: confira sempre no link de produção.

## Google Search Console

1. Acesse search.google.com/search-console > Adicionar propriedade > **Prefixo do URL** > cole `https://seu-projeto.vercel.app/`.
2. Verifique pelo método **Tag HTML**: copie a meta tag `google-site-verification` e cole no `<head>` do `index.html`, logo abaixo do `<meta name="viewport">`. Commit, push, aguarde o deploy e clique em Verificar.
3. Menu Sitemaps > envie `sitemap.xml`.
4. Inspeção de URL > cole a URL da home > Solicitar indexação.

A indexação depende da avaliação do próprio Google e pode levar de dias a semanas.

## Se conectar um domínio próprio

1. Vercel > Settings > Domains > adicione o domínio e configure o DNS como o Vercel indicar.
2. Defina o domínio novo como principal e configure o `seu-projeto.vercel.app` para redirecionar (308) para ele.
3. Rode `node scripts/set-site-url.mjs https://seudominio.com.br`, commit e push.
4. No Search Console, crie uma propriedade nova para o domínio, envie o sitemap de novo e use a Ferramenta de mudança de endereço na propriedade antiga.
