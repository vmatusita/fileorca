# Header

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O cabeçalho fino: logo, busca de ferramentas e idioma. Nada mais.

- 64px de altura, fundo `bg`, divisor `hairline` embaixo. Não gruda ao rolar: o único fixo da tela é a âncora do AdSense.
- Logo inline (Oli espelhada + "File" em `ink` e "Orca" em `brand`), 44px no computador, 38px no celular, link para a home do idioma. O SVG leva `role="img"` e `aria-label="FileOrca"`: é o nome do link (sem ele, o axe reprova `link-name`).
- Busca: no computador, pílula com "Search tools" e a dica `Ctrl K`; no celular, só o ícone. Abre o ToolSearch.
- Idioma: globo + código (EN, PT, ES). O nome acessível começa pelo código visível e completa em `fo-sr` ("EN · Language: English"); um `aria-label` que não contém "EN" reprova no axe (`label-content-name-mismatch`). Leva para a página equivalente pelo mapa de rotas; sem equivalente, para o hub do idioma.
- Logo, busca e idioma têm alvo de `tap-min` (48px).
- Sem menu hambúrguer: as categorias ficam na home e nos hubs.
