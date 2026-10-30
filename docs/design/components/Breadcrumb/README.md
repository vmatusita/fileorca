# Breadcrumb

Navegação · FileOrca design system v1.1. Estilo em `../bundle.css`; marcação de referência em [`preview.html`](preview.html) (abra com `?theme=dark` para o tema escuro).

O caminho da página, acima do H1, igual ao BreadcrumbList do schema.

- `small` 14px em `ink-muted`, a página atual em `ink` 600 com `aria-current="page"`. Separador `chevron-right` de 16px.
- Alvos com 6px de padding vertical para chegar a 32px de toque; no celular a linha pode quebrar.
- Sempre Home → hub da categoria → ferramenta → preset. O nome repete o H1 da página de destino.
