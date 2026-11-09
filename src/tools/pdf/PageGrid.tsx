// The page grid (F5a, decision 6; DECISOES § 152): one cell per page, with a small picture drawn only while the cell
// is on screen and let go when it leaves. Three uses:
//  - select: the cell is a toggle (aria-pressed), Space or a click picks it (Split, Delete, Sign, PDF pages);
//  - order: the cell moves with the pointer (drag), with its "earlier" and "later" buttons (WCAG 2.5.7: no drag needed)
//    and with the keyboard (Space picks the page up, the arrow keys move it, Space drops it) (Reorder);
//  - rotate: the cell turns its page a quarter clockwise (Rotate, page by page).
// One tab stop for the whole grid (roving focus: arrow keys, Home, End); the magnifier and the move buttons of the
// focused cell are in the tab order too. Every change is said once through the panel's status region, and the focus
// follows a moved page, so it never falls on the page. The look is the FileCard's: stroke, radius and the dog-ear in the
// PDF colour.
// F14 (DECISOES § 618 to § 622): each cell is a PageCell that draws again only when its own state changes (E-2); the
// sheet has the shape of the page as it will come out; "Small" and "Large" above the grid set the columns, and the
// pictures are asked at the width the sheet shows; the magnifier of each cell opens the page large; the anchor of
// Shift+click lives here, in one place, for the grid and the view.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { PageBox } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import OptionGroup from '../image/OptionGroup.tsx';
import PageCell, { type CellActions } from './PageCell.tsx';
import { THUMB_CAP, askWidth, quarters, samePages, sheetRatio } from './grid-math.ts';
import type { PdfIcons, Thumbnails } from './types.ts';

export interface PageGridProps {
  /** Prefix of the element ids. */
  id: string;
  name: string;
  boxes: PageBox[];
  mode: 'select' | 'order' | 'rotate';
  texts: PdfPanelTexts['grid'];
  icons: PdfIcons;
  thumbnails: Thumbnails | null;
  announce: (message: string) => void;
  /** The picked pages (select mode). */
  selected?: ReadonlySet<number>;
  /** F14 (§ 622): the grid works out every pick (one, all, none, the span of Shift+click) and hands the new list here. */
  onSelect?: (pages: number[]) => void;
  /** F14 (item 4): the grid of Delete, where a picked page is one that comes out. */
  removes?: boolean;
  /** Page indices in their current order (order mode). */
  order?: readonly number[];
  onMove?: (from: number, to: number) => void;
  /** Quarter turns added to each page (rotate mode). */
  turns?: Readonly<Record<number, number>>;
  onTurn?: (index: number) => void;
}

/**
 * Pixel width of a picture when nothing else asks: the grid used to ask this for every cell; since the F14 it asks the
 * width its sheets show (§ 619), and this stays the width of a call that names none.
 */
export const THUMB_WIDTH = 240;

export type GridSize = 'small' | 'large';
/**
 * "Small" or "Large" while the page is open (§ 619): never stored, so a new visit starts Small. A grid that comes back
 * (Rotate's "Adjust" opened again, Sign's "Pick pages" chosen again) keeps the person's choice.
 */
let remembered: GridSize = 'small';

/** The device pixel ratio, 1 where the page cannot tell. */
const pixelRatio = (): number => (typeof window !== 'undefined' && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1);

export default function PageGrid(props: PageGridProps) {
  const { id, name, boxes, mode, texts, icons, thumbnails, announce, selected, order, turns } = props;
  const total = boxes.length;
  const sequence = mode === 'order' && order ? order : boxes.map((_, i) => i);
  const [active, setActive] = useState(0);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const [size, setSize] = useState<GridSize>(remembered);
  /** Width in CSS pixels of the sheet of a cell, measured; 0 until the first measure. */
  const [sheet, setSheet] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  /** The page the focus follows and the place it is going to: the focus is set once that page is there. */
  const focusAfter = useRef<{ page: number; position: number } | null>(null);
  const dragging = useRef<number | null>(null);
  /**
   * F14 (§ 622): the anchor of Shift+click, the last page touched in the grid or picked in the view. It is the only
   * one: the view picks through `pick` below. A selection the grid did not hand out itself (a typed range, a new file,
   * Start over) has no anchor.
   */
  const anchor = useRef<number | null>(null);
  /** The last selection the grid handed out, and the one the last render was given. */
  const handed = useRef<number[] | null>(null);
  const picked = useMemo(() => [...(selected ?? [])], [selected]);
  const seen = useRef<number[]>(picked);
  if (!samePages(seen.current, picked)) {
    if (!handed.current || !samePages(handed.current, picked)) anchor.current = null;
    seen.current = picked;
    handed.current = null;
  }

  useEffect(() => {
    const wanted = focusAfter.current;
    if (!wanted) return;
    // The focus left the grid for another control since (Pick none, Reverse order): the wait is over, and taking the
    // focus back from that control would move it on the person's press (WCAG 3.2.2; DECISOES § 177).
    const active = document.activeElement;
    if (active && active !== document.body && !list.current?.contains(active)) {
      focusAfter.current = null;
      return;
    }
    // A move sets this grid's own state at once and the panel's order a render later, so an effect can run for a render
    // that still shows the old order. The focus waits until the moved page is in its new place: set earlier, it would land
    // on whichever page stood there and stay on it when the cells were reordered (criterion 10: it follows the page).
    const cell = list.current?.querySelector<HTMLElement>(`[data-position="${wanted.position}"]`);
    if (cell?.dataset['page'] !== String(wanted.page)) return;
    cell.querySelector<HTMLElement>('.fo-page__main')?.focus();
    focusAfter.current = null;
  });

  // The width of a sheet, measured before the first paint and again when the grid's width changes (§ 619): every cell has
  // the same column, so the first sheet tells. The pictures are asked at that width times the pixel ratio.
  useLayoutEffect(() => {
    const element = list.current;
    if (!element) return undefined;
    const measure = () => {
      const first = element.querySelector<HTMLElement>('.fo-page__sheet');
      const width = first ? first.getBoundingClientRect().width : 0;
      setSheet((old) => (Math.abs(old - width) < 0.5 ? old : width));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [size, total > 0]);
  const width = sheet > 0 ? askWidth(sheet, pixelRatio(), THUMB_CAP) : 0;

  const labelOf = (index: number): string => {
    const turn = quarters(boxes[index], turns?.[index] ?? 0) * 90;
    let label = fmt(texts.page, { n: index + 1, total });
    if (turn) label += fmt(texts.rotated, { degrees: turn });
    if (selected?.has(index)) label += texts.selected;
    return mode === 'rotate' ? `${fmt(texts.turn, { n: index + 1 })} (${label})` : label;
  };

  function columns(): number {
    const items = list.current?.children;
    if (!items || items.length < 2) return 1;
    const top = (items[0] as HTMLElement).offsetTop;
    let count = 0;
    for (const item of Array.from(items)) {
      if ((item as HTMLElement).offsetTop !== top) break;
      count += 1;
    }
    return Math.max(1, count);
  }

  /** Hands a new selection to the tool, remembering it was the grid's own (so the anchor stays). */
  function hand(pages: number[]): void {
    handed.current = pages;
    props.onSelect?.(pages);
  }

  /** Picks or unpicks one page, from the grid or the view: it becomes the anchor (§ 622). */
  function pick(index: number): void {
    const next = selected?.has(index) ? picked.filter((page) => page !== index) : [...picked, index];
    anchor.current = index;
    hand(next);
  }

  function selectAll(): void {
    anchor.current = null;
    hand(Array.from({ length: total }, (_, i) => i));
  }

  function selectNone(): void {
    anchor.current = null;
    hand([]);
  }

  function move(from: number, to: number): void {
    if (to < 0 || to >= sequence.length || from === to) return;
    focusAfter.current = { page: sequence[from] ?? 0, position: to };
    props.onMove?.(from, to);
    setActive(to);
    announce(fmt(texts.moved, { n: (sequence[from] ?? 0) + 1, position: to + 1 }));
  }

  /**
   * The focus goes to another cell. At an edge (ArrowLeft on the first page) nothing changes and nothing re-renders, so
   * no wait is left behind for a later render to act on (DECISOES § 177).
   */
  function go(position: number, target: number): void {
    if (target === position) return;
    setActive(target);
    focusAfter.current = { page: sequence[target] ?? 0, position: target };
  }

  function turn(index: number): void {
    props.onTurn?.(index);
    const degrees = quarters(boxes[index], (turns?.[index] ?? 0) + 1) * 90;
    announce(fmt(texts.turned, { n: index + 1, degrees }));
  }

  // The cells' one door to the grid (§ 620): made once, it reads the latest render through `latest`, so a cell's props
  // never change because of it.
  const latest = useRef({ sequence, mode, grabbed, pick, turn, move, go, columns, announce, texts });
  latest.current = { sequence, mode, grabbed, pick, turn, move, go, columns, announce, texts };
  const actions = useMemo<CellActions>(
    () => ({
      press(index, position) {
        const now = latest.current;
        setActive(position);
        if (now.mode === 'select') now.pick(index);
        if (now.mode === 'rotate') now.turn(index);
      },
      key(event, _index, position) {
        const now = latest.current;
        const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -now.columns(), ArrowDown: now.columns() };
        if (event.key in step) {
          event.preventDefault();
          const target = Math.min(now.sequence.length - 1, Math.max(0, position + (step[event.key] as number)));
          if (now.grabbed !== null) now.move(position, target);
          else now.go(position, target);
          return;
        }
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const target = event.key === 'Home' ? 0 : now.sequence.length - 1;
          if (now.grabbed !== null) now.move(position, target);
          else now.go(position, target);
          return;
        }
        if ((event.key === ' ' || event.key === 'Enter') && now.mode === 'order') {
          event.preventDefault();
          if (now.grabbed === null) {
            setGrabbed(now.sequence[position] ?? null);
            now.announce(fmt(now.texts.picked, { n: (now.sequence[position] ?? 0) + 1 }));
          } else {
            setGrabbed(null);
            // The drop has its own sentence: the moves were said as they happened, so none is said twice (criterion 10).
            now.announce(fmt(now.texts.dropped, { n: now.grabbed + 1, position: position + 1 }));
          }
        }
        if (event.key === 'Escape' && now.grabbed !== null) setGrabbed(null);
      },
      focus(position) {
        setActive(position);
      },
      blur(index, position) {
        // F13a (D-11): the focus left the page picked up (Tab, Shift+Tab, a click elsewhere), so it is let go where it
        // is; not while a move by the keyboard waits for the page in its new place (the focus passes by the body).
        const now = latest.current;
        if (now.grabbed !== index || focusAfter.current) return;
        setGrabbed(null);
        now.announce(fmt(now.texts.dropped, { n: index + 1, position: position + 1 }));
      },
      move(from, to) {
        latest.current.move(from, to);
      },
      zoom(_index, position) {
        // The page view opens here (section A of PLANO-UX-QV.md); until then the magnifier's cell is the active one.
        setActive(position);
      },
      dragStart(index, position, event) {
        dragging.current = position;
        event.dataTransfer?.setData('text/plain', String(index + 1));
      },
      dragOver(event) {
        if (dragging.current !== null) event.preventDefault();
      },
      drop(position, event) {
        if (dragging.current === null) return;
        event.preventDefault();
        latest.current.move(dragging.current, position);
        dragging.current = null;
      },
      dragEnd() {
        dragging.current = null;
      },
    }),
    [],
  );

  const chooseSize = (next: GridSize) => {
    remembered = next;
    setSize(next);
  };

  const helpId = `${id}-help`;
  const activePosition = Math.min(active, sequence.length - 1);
  return (
    <div class="fo-pages" data-mode={mode}>
      <OptionGroup
        name={`${id}-size`}
        legend={texts.sizeLegend}
        value={size}
        choices={[
          { value: 'small', label: texts.sizeSmall },
          { value: 'large', label: texts.sizeLarge },
        ]}
        onChange={chooseSize}
      />
      {mode === 'select' && (
        <div class="fo-pages__bar">
          <p class="fo-pages__count">{fmt(texts.selectedCount, { count: selected?.size ?? 0, total })}</p>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={selectAll}>
            {texts.selectAll}
          </button>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={selectNone}>
            {texts.selectNone}
          </button>
        </div>
      )}
      <ul class="fo-pages__grid" ref={list} data-size={size} aria-label={fmt(texts.label, { name })} aria-describedby={helpId}>
        {sequence.map((index, position) => (
          <PageCell
            key={index}
            index={index}
            position={position}
            mode={mode}
            label={labelOf(index)}
            selected={selected?.has(index) ?? false}
            removes={props.removes ?? false}
            turn={mode === 'rotate' ? (turns?.[index] ?? 0) : 0}
            ratio={sheetRatio(boxes[index], mode === 'rotate' ? (turns?.[index] ?? 0) : 0)}
            active={position === activePosition}
            grabbed={grabbed === index}
            first={position === 0}
            last={position === sequence.length - 1}
            width={width}
            thumbnails={thumbnails}
            texts={texts}
            icons={icons}
            actions={actions}
          />
        ))}
      </ul>
      <p class="fo-field__help" id={helpId}>
        {mode === 'order' ? texts.helpKeys : texts.help}
      </p>
    </div>
  );
}
