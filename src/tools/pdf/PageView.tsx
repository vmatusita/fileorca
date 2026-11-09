// The page view (F14; PLANO-UX-QV.md, section A; DECISOES § 624): one page, large, inside the tool. It opens in the place
// of the page grid (the five grid tools) and, from the result ("View the new PDF") and from a row of the Merge list ("View
// pages of {name}"), as the first item of the band under the rectangle (§ 625 and § 626). No dialog, popover or layer over
// the page: it pushes what is under it down, by a gesture of the person, and nothing of the site covers the anchor ad;
// nothing goes to the URL or to the history.
// From the top: the heading with "Back to the pages"; the page whole, in a frame of its shape ("Fit": the column, at most
// 100dvh - 260px high; "Enlarge": twice the column, up to 1,600 px, scrolling inside the frame); Previous, the action of
// the tool and Next. The keyboard: ← and → change the page, Home and End go to the ends, Esc goes back; in "Fit", a
// sideways swipe of 48 px or more on the page changes it too. The pictures come from the thumbnail cache of the file, at
// the width the frame shows: at most three large ones are held (the page, the one before and the one after, those two
// only once the page's own has come), and until it comes another picture of the page (the small one of the grid) stays in
// the same frame, which already has the shape of the page, so nothing moves.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent, TargetedPointerEvent } from 'preact';
import type { PageBox } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import Icon from '../../icons/Icon.tsx';
import { VIEW_FIT_CAP, VIEW_ZOOM_CAP, askWidth, sheetRatio } from './grid-math.ts';
import type { PdfIcons, Thumbnails } from './types.ts';
import checkIcon from '../../../docs/design/assets/Icons/check.svg?raw';

/** The action of each grid tool in the view: Delete, Split and Sign (pick), Rotate (page by page). Reorder has none. */
export type ViewAction = 'remove' | 'mark' | 'sign' | 'turn';

/** A picture asked of a thumbnail cache and held until it is let go, with the same width (DECISOES § 180). */
export interface Held {
  index: number;
  width: number;
  url: Promise<string | null>;
}

export interface PageViewProps {
  boxes: readonly PageBox[];
  /** The pages in the order Previous and Next follow (indices in the file; in Reorder, the order of the grid). */
  sequence: readonly number[];
  /** The page on screen, an index in the file. */
  index: number;
  thumbnails: Thumbnails;
  /** The small picture of the opening page, asked by the grid before its cell left (§ 624): the view lets it go. */
  held?: Held | null | undefined;
  /** The width of the small picture that stays in the frame while the large one comes. */
  small: number;
  texts: PdfPanelTexts['view'];
  icons: PdfIcons;
  /** Reorder: the heading says the position too. */
  order?: boolean | undefined;
  /** Quarter turns the person gave each page (Rotate): the large picture shows them. */
  turns?: Readonly<Record<number, number>> | undefined;
  action?: ViewAction | undefined;
  pressed?: boolean | undefined;
  onAct?: (() => void) | undefined;
  /** What the page is now (", picked", ", comes out", ", turned 90°"), said after its heading when the page changes. */
  state?: ((index: number) => string) | undefined;
  /** The view opens again in a grid drawn in another place: the focus lost on the way goes to its action. */
  resume?: boolean | undefined;
  announce: (message: string) => void;
  onGo: (index: number) => void;
  onBack: () => void;
}

/** The swipe that changes the page: 48 px or more, less than 30° from the horizontal (section A). */
const SWIPE = 48;
const SLOPE = Math.tan(Math.PI / 6);

export default function PageView(props: PageViewProps) {
  const { boxes, sequence, index, thumbnails, small, texts, icons, action } = props;
  const total = sequence.length;
  const position = Math.max(0, sequence.indexOf(index));
  const turn = (((props.turns?.[index] ?? 0) % 4) + 4) % 4;
  const [zoomed, setZoomed] = useState(false);
  /** The width in CSS pixels of the picture as drawn (before the person's turn), measured on the sheet. */
  const [shown, setShown] = useState(0);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [loaded, setLoaded] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  /** The pictures held, by "index:width"; null once the view is gone, so a late answer is dropped. */
  const held = useRef<Map<string, Held> | null>(null);
  const hold = (key: string, item: Held): void => {
    held.current?.set(key, item);
    void item.url.then((url) => {
      if (held.current?.get(key) === item) setUrls((old) => ({ ...old, [key]: url }));
    });
  };
  if (!held.current) {
    held.current = new Map();
    if (props.held) hold(`${props.held.index}:${props.held.width}`, props.held);
  }

  const measure = (): void => {
    const box = sheet.current?.getBoundingClientRect();
    if (!box) return;
    const width = turn % 2 ? box.height : box.width;
    setShown((old) => (Math.abs(old - width) < 0.5 ? old : width));
  };
  const measured = useRef(measure);
  measured.current = measure;
  // Every render: a page of another shape, a turn or the other mode changes the sheet. The window too, by the observer.
  useLayoutEffect(() => measured.current());
  useLayoutEffect(() => {
    if (props.resume) {
      // Drawn again in another place (Rotate's first turn): a focus lost on the way goes back to the action pressed.
      const active = document.activeElement;
      if (!active || active === document.body) (root.current?.querySelector<HTMLElement>('.fo-pview__act') ?? heading.current)?.focus();
    } else {
      // The view takes the screen and the focus goes to its heading (no smooth scroll anywhere on the site).
      root.current?.scrollIntoView({ block: 'nearest' });
      heading.current?.focus({ preventScroll: true });
    }
    const element = sheet.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => measured.current());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const ratio = typeof window !== 'undefined' && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1;
  const big = shown > 0 ? askWidth(shown, ratio, zoomed ? VIEW_ZOOM_CAP : VIEW_FIT_CAP) : 0;
  const bigKey = `${index}:${big}`;
  const bigUrl = big > 0 && held.current.has(bigKey) ? urls[bigKey] : undefined;
  const ready = Boolean(bigUrl) && loaded === bigKey;
  // Until the large picture is on screen, another one of the page already here stays under it (the small one of the grid,
  // or the large one of the other mode).
  const under = ready ? undefined : [...held.current.keys()].find((key) => key !== bigKey && key.startsWith(`${index}:`) && urls[key]);

  useEffect(() => {
    const now = held.current;
    if (!now) return;
    const want = new Map<string, number>();
    const add = (page: number | undefined, width: number): void => {
      if (page !== undefined && width > 0) want.set(`${page}:${width}`, page);
    };
    if (under) add(index, Number(under.split(':')[1]));
    else if (bigUrl === undefined) add(index, small);
    add(index, big);
    // The pages around only once the page's own large picture has come (section A).
    if (big > 0 && bigUrl !== undefined) {
      add(sequence[position - 1], big);
      add(sequence[position + 1], big);
    }
    const gone: string[] = [];
    for (const [key, item] of now) {
      if (want.has(key)) continue;
      now.delete(key);
      gone.push(key);
      thumbnails.drop(item.index, item.width);
    }
    for (const [key, page] of want) {
      const width = Number(key.split(':')[1]);
      if (!now.has(key)) hold(key, { index: page, width, url: thumbnails.get(page, width) });
    }
    if (gone.length > 0) {
      setUrls((old) => {
        const next = { ...old };
        for (const key of gone) delete next[key];
        return next;
      });
    }
  });
  useEffect(
    () => () => {
      const now = held.current;
      held.current = null;
      for (const item of now?.values() ?? []) thumbnails.drop(item.index, item.width);
    },
    [],
  );

  const title = (page: number, at: number): string => (props.order ? fmt(texts.titleOrder, { n: page + 1, p: at + 1, total }) : fmt(texts.title, { n: page + 1, total }));

  /** Shows the page at `at` in the sequence and says its heading once, with what the page is now. */
  function go(at: number): void {
    const target = Math.min(total - 1, Math.max(0, at));
    const page = sequence[target];
    if (target === position || page === undefined) return;
    props.announce(title(page, target) + (props.state?.(page) ?? ''));
    props.onGo(page);
  }

  function key(event: TargetedKeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      props.onBack();
      return;
    }
    // Enlarged, the frame takes the focus so the arrow keys scroll it (WCAG 2.1.1): there they scroll.
    if ((zoomed && event.target === frame.current) || event.altKey || event.ctrlKey || event.metaKey) return;
    const moves: Record<string, number> = { ArrowLeft: position - 1, ArrowRight: position + 1, Home: 0, End: total - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    go(moves[event.key] as number);
  }

  function down(event: TargetedPointerEvent<HTMLDivElement>): void {
    if (zoomed || !event.isPrimary) return;
    swipe.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the page no longer has: the up event decides alone.
    }
  }

  function up(event: TargetedPointerEvent<HTMLDivElement>): void {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId || zoomed) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    // Only with the page at the browser's own zoom: a pinched page pans under the finger.
    const scale = window.visualViewport?.scale ?? 1;
    if (Math.abs(dx) >= SWIPE && Math.abs(dy) < Math.abs(dx) * SLOPE && scale >= 0.99 && scale <= 1.01) go(position + (dx < 0 ? 1 : -1));
  }

  const style = `--view-ratio:${sheetRatio(boxes[index], turn).toFixed(4)}`;
  const picture = (url: string | null | undefined, kind: string, own: string) =>
    url ? <img key={kind} class={kind} src={url} alt="" draggable={false} data-key={own} data-turn={turn || undefined} style={turn ? `rotate:${turn * 90}deg` : undefined} onLoad={kind === 'fo-pview__img' ? () => setLoaded(own) : undefined} /> : null;
  const actionIcon = action === 'remove' ? <Icon inner={icons.trash} /> : action === 'turn' ? <Icon inner={icons.rotate} /> : <Icon raw={checkIcon} />;
  return (
    <div ref={root} class="fo-pview" onKeyDown={key}>
      <div class="fo-pview__top">
        <h3 ref={heading} class="fo-pview__title" tabindex={-1}>
          {title(index, position)}
        </h3>
        <button type="button" class="fo-btn fo-pview__size" onClick={() => setZoomed(!zoomed)}>
          {zoomed ? texts.fit : texts.enlarge}
        </button>
        <button type="button" class="fo-btn fo-btn--ghost fo-pview__back" onClick={props.onBack}>
          <Icon inner={icons.chevron} class="fo-icon--sm" />
          {texts.back}
        </button>
      </div>
      <div ref={frame} class="fo-pview__frame" data-zoom={zoomed ? '' : undefined} role="group" aria-label={fmt(texts.frame, { n: index + 1 })} tabindex={zoomed ? 0 : undefined} style={style}>
        <div ref={sheet} class="fo-pview__sheet" onPointerDown={down} onPointerUp={up} onPointerCancel={() => (swipe.current = null)}>
          {picture(under ? urls[under] : null, 'fo-pview__under', under ?? '')}
          {picture(bigUrl, 'fo-pview__img', bigKey)}
        </div>
      </div>
      <div class={action ? 'fo-pview__bar' : 'fo-pview__bar fo-pview__bar--two'}>
        <button type="button" class="fo-btn fo-pview__prev" aria-disabled={position === 0 ? 'true' : undefined} onClick={() => go(position - 1)}>
          <Icon inner={icons.chevron} class="fo-icon--sm" />
          {texts.previous}
        </button>
        {action && (
          <button type="button" class="fo-btn fo-pview__act" aria-pressed={action === 'turn' ? undefined : Boolean(props.pressed)} onClick={props.onAct}>
            {actionIcon}
            {texts[action]}
          </button>
        )}
        <button type="button" class="fo-btn fo-pview__next" aria-disabled={position === total - 1 ? 'true' : undefined} onClick={() => go(position + 1)}>
          {texts.next}
          <Icon inner={icons.chevron} class="fo-icon--sm" />
        </button>
      </div>
    </div>
  );
}
