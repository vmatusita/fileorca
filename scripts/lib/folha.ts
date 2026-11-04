// Renders docs/oli/folha.html, the Oli sheet (F1b, decision 8): every pose of the closed list (ten since the F12, with the
// sad of the ad-block wall) at 32, 64 and 512 px
// and the app icon at 16 and 32 px, on a light and a dark background. Pure and deterministic; the
// page is standalone (inline style, the sprite once, the icon as a data URI) and opens from file://.
import { POSES, type Pose } from '../../src/oli/poses.ts';
import { spriteMarkup, type Sprite } from '../../src/oli/sprite.ts';

export interface FolhaColors {
  lightBg: string;
  lightInk: string;
  darkBg: string;
  darkInk: string;
  muted: string;
}

export interface FolhaInput {
  sprite: Sprite;
  appIconSvg: string;
  colors: FolhaColors;
}

const POSE_SIZES = [32, 64, 512] as const;
const ICON_SIZES = [16, 32] as const;

const THEMES = [
  { id: 'claro', title: 'Fundo claro', note: 'O aro branco some no fundo claro.' },
  { id: 'escuro', title: 'Fundo escuro', note: 'No escuro o aro vira adesivo: confira o contorno da silhueta.' },
] as const;

// The peek box is 128:80; the other poses are square.
const heightOf = (pose: Pose, size: number) => (pose === 'peek' ? (size * 80) / 128 : size);

function css(colors: FolhaColors): string {
  return [
    '*,*::before,*::after{box-sizing:border-box}',
    `body{margin:0;background:${colors.lightBg};color:${colors.lightInk};font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}`,
    '.fo-sprite{position:absolute;width:0;height:0;overflow:hidden}',
    '.miolo{max-width:1240px;margin:0 auto;padding:24px 16px}',
    'h1{margin:0 0 8px;font-size:28px;line-height:1.2}',
    'h2{margin:0 0 4px;font-size:22px;line-height:1.2}',
    'h3{margin:24px 0 8px;font-size:14px;font-weight:600;letter-spacing:.02em}',
    'p{margin:0 0 8px;max-width:68ch}',
    `.nota{color:${colors.muted};font-size:14px}`,
    `.fundo{border-top:1px solid ${colors.muted}}`,
    '.fundo .nota{color:inherit}',
    `.fundo--claro{background:${colors.lightBg};color:${colors.lightInk}}`,
    `.fundo--escuro{background:${colors.darkBg};color:${colors.darkInk}}`,
    '.grade{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px}',
    '.pose{display:flex;flex-direction:column;align-items:center;gap:4px;margin:0}',
    '.pose svg,.pose img{display:block;max-width:100%;height:auto}',
    '.pose figcaption{font:12px/1.2 ui-monospace,Consolas,monospace}',
  ].join('\n');
}

function poseFigure(pose: Pose, size: number): string {
  const [width, height] = [size, heightOf(pose, size)];
  return `<figure class="pose"><svg width="${width}" height="${height}" aria-hidden="true"><use href="#oli-${pose}"/></svg><figcaption>${pose}</figcaption></figure>`;
}

function iconFigure(dataUri: string, size: number): string {
  return `<figure class="pose"><img src="${dataUri}" width="${size}" height="${size}" alt="Ícone do app em ${size} px"><figcaption>${size} px</figcaption></figure>`;
}

function section(theme: (typeof THEMES)[number], dataUri: string): string {
  const rows = POSE_SIZES.map(
    (size) => `<h3>Poses em ${size} px</h3>\n<div class="grade">\n${POSES.map((pose) => poseFigure(pose, size)).join('\n')}\n</div>`,
  );
  const icons = `<h3>Ícone do app em ${ICON_SIZES.join(' e ')} px</h3>\n<div class="grade">\n${ICON_SIZES.map((size) => iconFigure(dataUri, size)).join('\n')}\n</div>`;
  return [
    `<section class="fundo fundo--${theme.id}" aria-labelledby="fundo-${theme.id}">`,
    '<div class="miolo">',
    `<h2 id="fundo-${theme.id}">${theme.title}</h2>`,
    `<p class="nota">${theme.note}</p>`,
    ...rows,
    icons,
    '</div>',
    '</section>',
  ].join('\n');
}

export function renderFolha(input: FolhaInput): string {
  for (const [name, value] of Object.entries(input.colors)) {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`folha: cor ${name} inválida: ${value}`);
  }
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(input.appIconSvg, 'utf8').toString('base64')}`;
  return [
    '<!doctype html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    '<title>Folha da Oli · FileOrca</title>',
    `<style>\n${css(input.colors)}\n</style>`,
    '</head>',
    '<body>',
    spriteMarkup(input.sprite, POSES),
    '<header>',
    '<div class="miolo">',
    '<h1>Folha da Oli</h1>',
    '<p>As dez poses da Oli lado a lado, em 32, 64 e 512 px, e o ícone do app em 16 e 32 px, sobre fundo claro e escuro. Abra esta folha antes da F2 e faça a busca reversa no Google Lens com um print de cada pose, para ver se alguma lembra demais um personagem que já existe. Qualquer ajuste de desenho vai para a run 1c.</p>',
    '<p class="nota">Gerada por <code>node scripts/design/folha.ts</code> a partir do mesmo sprite do site. Não edite à mão: rode o script de novo.</p>',
    '</div>',
    '</header>',
    '<main>',
    ...THEMES.map((theme) => section(theme, dataUri)),
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}
