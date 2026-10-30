# AdSlot

Monetização · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O espaço do anúncio: um retângulo neutro, com altura reservada e o rótulo "Advertisements" / "Publicidade" / "Anuncios". Ele não tem marca: nenhuma cor da paleta, nenhum traço, nenhuma Oli.

- O rótulo é exatamente uma destas palavras, as únicas que o AdSense aceita em cada idioma: "Advertisements" (ou "Sponsored Links"), "Publicidade" (ou "Links patrocinados"), "Anuncios" (ou "Enlaces patrocinados"). "Advertisement" no singular e "Publicidad" não estão na lista.
- Fundo `ad-ground`, `radius-xs`, rótulo `caption` em `ink-muted`. A altura mínima é reservada antes do anúncio chegar (CLS ≤ 0,05): 280px no conteúdo, 600px na coluna lateral.
- Margem vertical de `ad-clearance` (150px) embutida: entre um AdSlot e o Baixar, os campos, o painel ou a Oli há sempre 150px. O Playwright mede a 360×740 e 1280×800.
- Variantes: `fo-ad--content` (responsiva, no meio do conteúdo, no máximo uma a cada duas telas) e `fo-ad--rail` (300×600, a partir de 1280px, não gruda).
- Recebe a área (`arquivos`, `dinheiro`, `casa-saude`, `utilidades`) e só carrega script com as três variáveis de build preenchidas.
- Nunca: acima da ferramenta no celular, dentro do painel, ao lado do Baixar, na tela de processamento, dentro do cronograma, nas páginas jurídicas. Nunca estilize nada do site para parecer anúncio, nem o anúncio para parecer site.
