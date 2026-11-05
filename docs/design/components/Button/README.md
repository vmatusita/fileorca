# Button

Ações · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O botão da FileOrca é uma pílula com o traço de 2px e um "lábio" sólido embaixo: ele parece um botão de brinquedo e afunda quando você aperta.

**Regra do lábio:** só o que se aperta tem lábio (`shadow-lip*`). Card que leva a outra página levanta com `shadow-lift` no hover; nada que não é ação ganha sombra sólida.

## Variantes

| Classe | Uso |
|---|---|
| `fo-btn--download` | O Baixar. Fundo `sun`, texto `on-sun`. Um por tela, sempre com o ícone `download` e, quando houver, o tamanho do arquivo em `fo-btn__meta`. Nunca perto de anúncio (`ad-clearance`). |
| `fo-btn--brand` | Escolher arquivos, dentro da DropZone, e o "recarregar" da parede do bloqueador ([AdblockWall](../AdblockWall/README.md); F12, DECISOES § 433). Um por tela. |
| (padrão) | Ações secundárias: CSV, Copiar link, Aceitar/Recusar cookies. |
| `fo-btn--ghost` | Ações de saída e de baixo risco: Começar de novo, Cancelar. Sem traço, sem lábio. |
| `fo-btn--icon` | Ações de linha (remover, baixar um arquivo do lote). Sempre com `aria-label`. |
| `fo-btn--lg` / `fo-btn--sm` / `fo-btn--block` | Tamanho: `button-lg` (60px) para Baixar, Escolher e o recarregar da parede; `--sm` (40px) só no computador; `--block` no celular. |

Sobre `deep` (ResultCard), envolva em `.fo-deep`: o Baixar troca o lábio para `shadow-lip-on-deep` e o ghost passa a `on-deep`.

## Estados

- **Hover:** sobe 1px. **Ativo:** desce `lip` (4px) e o lábio some. **Foco:** anel `focus` de 3px a 2px.
- **Ocupado:** `aria-busy="true"` + `.fo-spin` e um texto que diz o que acontece ("Zipping 12 files…"). Não troque o texto por "Loading".
- **Desabilitado:** `disabled` → `surface-sunken`, `ink-muted`, sem lábio. O Baixar nunca aparece desabilitado: ele só existe quando o arquivo está pronto.

## Texto

Verbo primeiro, sem ponto final, sem "Click here". Download / Baixar / Descargar. O tamanho entra depois de um ponto médio: "Download · 780 KB".

## O consumidor fornece

O elemento (`<button>` para ação, `<a>` para navegação ou download com `href`), o texto e o ícone (inline, `fo-icon`). O componente não decide o que acontece.

## Faça / Não faça

| Faça | Não faça |
|---|---|
| Um `sun` por tela | Amarelo em qualquer outra coisa (aviso, destaque, card de café) |
| Deixar o Baixar a 150px de qualquer AdSlot | Botão com cara de anúncio, ou anúncio com cara de botão |
| Ghost para sair | Dois botões primários lado a lado |

## Mudanças de regra (F13b, DECISOES § C-8; F7 f-9 e f-10)

- **O tamanho no Baixar.** Antes (Texto): "O tamanho entra depois de um ponto médio: Download · 780 KB." Depois: quando o tamanho não cabe na linha do Baixar, ele vai sempre na segunda linha, sem o ponto médio, no botão de 60 px (hoje, só o Baixar PNG do QR: "Download PNG" e, embaixo, "481 × 481 px").
- **O Baixar que some.** O "Baixar nunca aparece desabilitado" (Estados) passa a valer também no QR e nas calculadoras: sem código ou sem resultado válido, o Baixar não aparece, e o lugar dele guarda a altura e diz por quê ("Nothing to download yet: type a link or some text."; na calculadora, a mensagem do erro no card). Antes: o Baixar do QR e o PDF da calculadora ficavam desligados e cinza.
