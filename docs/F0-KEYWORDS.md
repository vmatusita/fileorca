# Keywords da F0: origem e o que falta conferir

O `data/keywords.csv` foi preenchido em 30/out/2026 com **estimativas de fontes públicas de SEO**, não com o Keyword Planner logado. Pela regra do plano, **55 linhas entram e 7 ficam fora**, todas as 7 presets de imagem da F2. A regra foi conferida por script linha a linha.

| Fase | Entram | Fora |
| --- | --- | --- |
| F2 | 13 | 7 |
| F4 | 18 | 0 |
| F5 | 12 | 0 |
| F7 | 12 | 0 |

## Como ler os números

- **Volume:** só 6 dos 62 termos têm número publicado com o termo exato (ou quase) nos EUA: heic to jpg, webp to jpg, avif to jpg, personal loan, auto loan e due date. O resto é estimativa pelo tamanho do nicho e deve ser lido como baixa confiança.
- **Lance:** nenhuma fonte aberta publica o lance de topo de página (faixa baixa e alta). As 4 linhas com valor em `lance_topo_max_usd` (mortgage 3.17, personal loan 2.64, auto loan 1.22, due date 0.36) têm **CPC médio**, não o lance de topo. As outras 58 estão vazias e contam 1 na ordem de construção.
- **Tendência:** "caindo" só em `resize-image/x-header` (troca de Twitter para X). As variações de um ano contra o outro sem queda contínua ficaram como "estavel".

## O que conferir no Keyword Planner, e até quando

Os itens abaixo só mudam a decisão ou a ordem da fase em que entram. Conferir antes de gerar o prompt da fase basta; nenhuma run faz isso (contas e serviços externos ficam fora de toda run).

| Antes da | Conferir | Por quê |
| --- | --- | --- |
| F2 (até 8/nov) | Volume de `compress image to 100kb`, `to 200kb`, `to 500kb`, `to 1mb` e `youtube thumbnail resizer` | Estão perto de 1K: podem virar de entra para fora, ou o contrário |
| F2 | Trocar o termo dos 5 presets de rede social (opcional, ver abaixo) | É a mudança que mais muda a decisão |
| F4 (até 15/nov) | Faixa de `mortgage calculator` e lance de topo (baixo e alto) das 18 linhas de dinheiro | As fontes vão de 300K a 3,35M; o lance é o que ordena a F4 |
| F7 (até 29/nov) | Faixa de `bmi calculator` e lance das linhas de saúde e do QR code | Lance abaixo de 1 empurra a linha para baixo na ordem |

Corrigiu algum valor? Edite a linha no CSV numa branch `ajuste-keywords`, abra a PR e faça o merge (ou peça uma run curta de ajuste). A run da fase lê o CSV como estiver na main.

## Opção: trocar o termo dos presets de rede social

Os termos "…resizer" e "resize image for…" têm pouca busca, mas a página tem demanda pelo termo de medida. O slug não muda, só a coluna `termo`. Se trocar, confira o volume no Planner e refaça a decisão:

| slug | termo atual | termo sugerido | volume do sugerido (estimativa) |
| --- | --- | --- | --- |
| resize-image/instagram-post | resize image for instagram post | instagram post size | 33.100 (Clicks.so) |
| resize-image/instagram-story | resize image for instagram story | instagram story size | ~20.000 (inferido) |
| resize-image/linkedin-banner | linkedin banner resizer | linkedin banner size | ~20.000 (inferido) |
| resize-image/x-header | twitter header resizer | x header size | ~2.000, subindo (inferido) |
| resize-image/facebook-cover | facebook cover photo resizer | facebook cover photo size | ~40.000 (inferido) |
| resize-image/youtube-thumbnail | youtube thumbnail resizer | youtube thumbnail size | ~50.000 (inferido) |

Outras variações que podem ter mais volume para a mesma página: "jpg to pdf" (image-to-pdf), "jpg to webp" (convert-to-webp), "balloon payment calculator" (balloon), "apy calculator" (apr-to-apy), "savings calculator" (savings-goal), "how much house can i afford calculator" (home-affordability).

## Fontes principais

- [Cleanor: HEIC to JPG, recorte do Keyword Planner](https://cleanor.app/blog/heic-to-jpg-conversion-file-size-tax-benchmark)
- [American Governance Today: buscas para converter imagens para JPEG nos EUA](https://www.americangovernancetoday.com/article/935658333-an-estimated-half-a-million-plus-u-s-searches-a-month-look-for-a-way-to-convert-image-files-back-to-jpeg)
- [kwrds.ai: Personal Loans](https://www.kwrds.ai/top-keywords/Personal-Loans) e [auto financing](https://www.kwrds.ai/top-keywords/auto-financing)
- [Theseolabs: mortgage](https://www.theseolabs.com/keywords-lists/mortgage/) e [pregnancy](https://www.theseolabs.com/keywords-lists/pregnancy/) (volume global)
- [YourPortalOnline: mortgage SEO keywords](https://yourportalonline.com/top-mortgage-seo-keywords-your-audience-is-using/)
- [Clicks.so: Instagram keywords](https://resources.clicks.so/popular-keywords/instagram-keywords)
- [Keysearch: pregnancy keywords](https://www.keysearch.co/top-keywords/pregnancy-keywords) e [Instagram keywords](https://www.keysearch.co/top-keywords/instagram-keywords)
- [QR TIGER: QR code forecast](https://www.qrcode-tiger.com/qr-code-forecast) e [Treendly: QR code](https://treendly.com/trend/qr-code)
