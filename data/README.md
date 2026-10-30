# data/keywords.csv

A saída do passo 21 da F0. Uma linha por página de ferramenta ou preset em inglês (62 linhas). As runs usam este arquivo para decidir o que entra em cada fase e em que ordem construir.

## Colunas

| Coluna | Quem preenche | Valores |
| --- | --- | --- |
| `slug` | já vem | caminho da página em inglês, sem barras nas pontas (`compress-image/to-100kb` vira `/compress-image/to-100kb/`) |
| `area` | já vem | `imagem`, `pdf`, `dinheiro`, `casa`, `saude`, `utilidades` |
| `fase` | já vem | `F2`, `F4`, `F5`, `F7` |
| `tipo` | já vem | `ferramenta-imagem`, `ferramenta-pdf`, `preset-imagem`, `calculadora`, `preset-dinheiro`, `qr-code` |
| `termo` | já vem | a busca em inglês colada no Keyword Planner |
| `volume_eua_faixa` | Victor | exatamente um de: `0-10`, `10-100`, `100-1K`, `1K-10K`, `10K-100K`, `100K-1M`, `1M-10M` |
| `lance_topo_min_usd` | Victor | número com ponto decimal (`2.35`) ou vazio |
| `lance_topo_max_usd` | Victor | número com ponto decimal ou vazio |
| `trends_12m` | Victor | `subindo`, `estavel` ou `caindo` (queda contínua nos 12 meses, EUA) |
| `decisao` | Victor (as ferramentas já vêm com `entra`) | `entra` ou `fora` |

Planner: país Estados Unidos, idioma inglês, conta do Google Ads em USD. Trends: Estados Unidos, últimos 12 meses.

## Regra da decisão

| Tipo | `entra` quando |
| --- | --- |
| `ferramenta-imagem` e `ferramenta-pdf` | sempre |
| `preset-imagem` | volume `1K-10K` ou maior **e** Trends diferente de `caindo` |
| `calculadora`, `preset-dinheiro` e `qr-code` | (volume `1K-10K` ou maior, **ou** `100-1K` com `lance_topo_max_usd` de 3 ou mais) **e** Trends diferente de `caindo` |
| qualquer outro caso | `fora` |

## Ordem de construção dentro da fase

Piso da faixa de volume vezes `lance_topo_max_usd` (sem lance, conta 1), do maior para o menor. Quem calcula é a run.

## Cuidados

- Edite num editor de texto (VS Code), não no Excel: o Excel em português troca ponto por vírgula e o separador do arquivo.
- Separador vírgula, codificação UTF-8, uma linha por página. Não renomeie nem reordene colunas.
