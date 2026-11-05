# Ícones

71 ícones próprios, grade de 24×24, traço 2px, pontas e cantos redondos. Estes arquivos têm o traço em Orca `#0F1B2D`, para uso em `<img>`. No site, use a versão inline com `stroke="currentColor"`, `class="fo-icon"` (24px) ou `fo-icon fo-icon--sm` (20px) e `aria-hidden="true"`: é o mesmo desenho, só troca o atributo `stroke`.

- Arquivo e mídia: file, image, pdf, upload, download, paste, trash.
- Ferramentas: compress, resize, crop, rotate, convert, merge, split, lock, unlock, qr, sign, watermark, page-number, reorder (os quatro últimos desenhados na F5a, DECISOES § 149).
- Calculadoras e áreas: calculator, home, heart, table, sparkline, link.
- Interface: search, globe, shield, check, alert, info, close, chevron-down, chevron-right, arrow-right, coffee, offline.
- Cabeçalho: menu, sun, moon, theme-system, book (desenhados na F10 e trazidos na F11 com o traço em Orca no arquivo, DECISOES § 384: o Menu, os três estados do tema e os Guias).
- Ferramentas de imagem: phone-photo (HEIC para JPG), browser-image (WebP para JPG).
- Calculadoras de dinheiro: wallet, car, refinance, key, card, trend-down, balance, growth, piggy, coins, percent, coin-plus, calendar, balloon.
- Calculadoras de casa: area, bag, shovel, paint, tile, thermometer.
- Calculadoras de saúde: weight, apple, tape, stroller.
- DropZone: file-drop (o selo em repouso: um arquivo que entra na água).
- Os 27 das cinco linhas acima foram desenhados na F10 (UX-16, `docs/propostas/ux-v2/icons/`, DECISOES § 379) e trazidos na F13a byte a byte, com o traço em Orca no arquivo (DECISOES § 490). Com eles, cada ferramenta tem o seu ícone, e nenhum hub repete um ícone entre os cartões dele (`tests/unit/hub-icons.test.ts`, no `dist/`). Na home, que junta as categorias, só o compress e o rotate se repetem: o mesmo verbo num cartão de imagem e num de PDF, em cores de categoria diferentes. A página de atalho usa o ícone da ferramenta, salvo quando aparece na mesma grade dela (os atalhos da hipoteca e o balão), e então ganha o próprio.

Ícone sozinho só em ação de linha, com `aria-label` no botão. Ferramenta que pede um ícone que não existe (como foram o assinar, a marca d'água e, na F13a, o carro, o cartão e os outros 25 desta lista) ganha um desenhado na mesma grade e no mesmo traço, que entra aqui com decisão registrada no DECISOES.md.
