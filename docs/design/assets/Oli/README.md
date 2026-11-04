# Oli · as dez poses

SVG de 128×128 (a `peek` é 128×80), até 2,8 KB cada. Cores fixas da paleta: corpo Orca `#0F1B2D`, mancha e barriga Espuma `#F7FAFD`, dobra da barbatana Oceano `#0B63F6`, bochecha `#FF9CA8` e, só no vidro da máscara da `lost`, a Água clara `#D6E6FF`. O aro Espuma por trás da silhueta é parte do desenho: não remova.

| Arquivo | Momento |
| --- | --- |
| `oli-wave.svg` | Repouso e topo das páginas; a nadadeira acena |
| `oli-gulp.svg` | Arquivo sobre a DropZone: boca aberta, olho brilhando, o arquivo entrando |
| `oli-swim.svg` | Processando, na superfície da água do WaterLevel |
| `oli-cheer.svg` | Pronto: salta com respingos (no ResultHero, sem o salto) |
| `oli-oops.svg` | Erro: cabeça inclinada e gota de suor |
| `oli-buoy.svg` | Offline, com boia |
| `oli-lost.svg` | 404, com máscara e snorkel |
| `oli-coffee.svg` | Página de apoio, com a caneca |
| `oli-peek.svg` | Busca sem resultado: o rosto espiando de baixo, recortado |
| `oli-sad.svg` | Só na parede do bloqueador de anúncios (F12): a cabeça baixa, a pálpebra caída, o olhar para baixo e para o conteúdo, a boca pequena para baixo e a nadadeira caída. Sem lágrima, sem súplica e sem gesto para botão |

Lista fechada: pose nova só com decisão registrada no DECISOES.md. A `sad` entrou na F12 (DECISOES § 417), só para a parede do bloqueador: nenhuma outra peça usa.

**No site:** as poses entram inline num sprite (F1b), um `<symbol>` por pose, peças compartilhadas (corpo, barbatana com a dobra, mancha, olho, bochecha, boca, nadadeira, cauda e o aro de 9px), `aria-hidden="true"`, até 4 KB por pose. O `clipPath` `oli-clip` é declarado uma vez na página e serve a todas as poses e ao logo. O `clipPath` `ic` da `oli-peek.svg` é sobra do ícone do app e não entra no sprite.

**Estes arquivos** servem para Open Graph, kit do Product Hunt e referência. Tamanhos: a Oli inteira de 32px para cima; abaixo disso, o ícone do app (`../Logo/app-icon.svg`).
