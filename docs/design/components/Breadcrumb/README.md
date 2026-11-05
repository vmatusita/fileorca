# Breadcrumb

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O caminho da página, acima do H1, igual ao BreadcrumbList do schema.

- `small` 14px em `ink-muted`, a página atual em `ink` 600 com `aria-current="page"`. Separador `chevron-right` de 16px.
- Alvos com 6px de padding vertical para chegar a 32px de toque; no celular a linha pode quebrar.
- Sempre Home → hub da categoria → ferramenta → preset; num guia, Home → Guides → o guia (F11, DECISOES § 396). O nome repete o H1 da página de destino.

## Mudança de regra (F13b, DECISOES § 544 e § 582)

- **A página atual numa calculadora, no celular (§ 544).** Antes: "a página atual em `ink` 600 com `aria-current`", à vista em toda página. Depois: abaixo de 768px, nas páginas de calculadora (o topo `.fo-top--calcpage`), o item da própria página fica só para o leitor de tela (com o `aria-current`), e o separador antes dele sai: o H1 logo embaixo diz o mesmo, e as trilhas de es e pt iam a duas linhas. Os guias e as ferramentas mostram a trilha inteira.
- **O hub nas presets, abaixo de 360px (§ 582).** Antes: "Sempre Home → hub da categoria → ferramenta → preset". Depois: abaixo de 360px, uma trilha de quatro passos (as presets de imagem, com a opção `skipHub` do `Breadcrumb.astro`) não mostra o hub e fica com Home → ferramenta → preset, em duas linhas; o `BreadcrumbList` do schema continua com os quatro, e de 360px para cima nada muda.
