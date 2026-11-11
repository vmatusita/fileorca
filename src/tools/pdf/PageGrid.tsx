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
// F18 (decision 6 of the prompt): a fourth use, organize (Organize PDF). It picks like select (a press, Shift+click,
// Shift+Space, Pick all, Pick none, Invert, a typed range), moves like order (the arrows of the cell and the mouse; Space
// and Enter pick, so no key does two things), and a bar over the grid turns the picked pages or takes them out. A page
// that comes out stays in the grid with Delete's look until it is put back.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { PageBox } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import Icon from '../../icons/Icon.tsx';
import OptionGroup from '../image/OptionGroup.tsx';
import PageCell, { type CellActions } from './PageCell.tsx';
import PageView, { type Held, type ViewAction, type ViewActions } from './PageView.tsx';
import { THUMB_CAP, askWidth, countOf, inverted, leavingCount, markedCount, outAfter, quarters, samePages, sheetRatio, span, spanned, turnedBy } from './grid-math.ts';
import type { PdfIcons, Thumbnails } from './types.ts';

export interface PageGridProps {
  /** Prefix of the element ids. */
  id: string;
  name: string;
  boxes: PageBox[];
  mode: 'select' | 'order' | 'rotate' | 'organize';
  texts: PdfPanelTexts['grid'];
  icons: PdfIcons;
  thumbnails: Thumbnails | null;
  announce: (message: string) => void;
  /**
   * The picked pages (select mode): the same Set while the list of picks is the same (`setOf(state.picked)` of
   * grid-math.ts), so a new list the grid did not hand out, even of the same pages, drops the anchor (§ 628).
   */
  selected?: ReadonlySet<number>;
  /** F14 (§ 622): the grid works out every pick (one, all, none, the span of Shift+click) and hands the new list here. */
  onSelect?: (pages: number[]) => void;
  /** F14 (item 4): the grid of Delete, where a picked page is one that comes out. */
  removes?: boolean;
  /** Page indices in their current order (order mode). */
  order?: readonly number[];
  onMove?: (from: number, to: number) => void;
  /** Quarter turns added to each page (rotate and organize modes). */
  turns?: Readonly<Record<number, number>>;
  onTurn?: (index: number) => void;
  /** F18, organize mode: the pages that come out (`setOf(state.out)`). */
  out?: ReadonlySet<number>;
  /** F18, organize mode: the grid works out the turns and the pages out after a gesture of the bar or of the view. */
  onOrganize?: (change: { turns?: Record<number, number>; out?: number[] }) => void;
  /** F14 (DECISOES § 624): the page view the magnifier opens, with its words and the action of the tool (none in Reorder). */
  view: { texts: PdfPanelTexts['view']; action?: ViewActions };
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
/**
 * F14 (§ 624): the page on view, while the page is open. A grid drawn again in another place (the first turn of Rotate
 * brings the result, and the grid goes under "Adjust") is a new grid: with the same cache (the same file), it opens the
 * view where it was. Back to the pages forgets it; the cache is held weakly, so an old file is never kept alive by it.
 */
let kept: { thumbnails: WeakRef<Thumbnails>; index: number } | null = null;

/** The device pixel ratio, 1 where the page cannot tell. */
const pixelRatio = (): number => (typeof window !== 'undefined' && window.devicePixelRatio > 0 ? window.devicePixelRatio : 1);

export default function PageGrid(props: PageGridProps) {
  const { id, name, boxes, mode, texts, icons, thumbnails, announce, selected, order, turns, out } = props;
  const total = boxes.length;
  const organize = mode === 'organize';
  const sequence = (mode === 'order' || organize) && order ? order : boxes.map((_, i) => i);
  /** Quarter turns the person gave a page (rotate and organize). */
  const turnOf = (index: number): number => (mode === 'rotate' || organize ? (turns?.[index] ?? 0) : 0);
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
  /**
   * F14 (§ 624): the page on view, with the cache it was opened on (a new file has a new one: the view closes) and the
   * small picture the grid held for it before its cell left.
   */
  const [viewing, setViewing] = useState<{ index: number; thumbnails: Thumbnails; held: Held | null; resume?: boolean } | null>(() =>
    kept && thumbnails && kept.thumbnails.deref() === thumbnails ? { index: kept.index, thumbnails, held: null, resume: true } : null,
  );
  const open = viewing && viewing.thumbnails === thumbnails && viewing.index < total ? viewing : null;
  /** The page whose magnifier takes the focus back when the view closes, spent only once it is there (§ 510). */
  const back = useRef<number | null>(null);
  const picked = useMemo(() => [...(selected ?? [])], [selected]);
  // F14 (§ 628): a new list of picks is told by its Set (`setOf`), so a typed range of the very pages already picked
  // drops the anchor too; a list the grid handed out itself keeps it.
  const seen = useRef(selected);
  if (seen.current !== selected) {
    if (!handed.current || !samePages(handed.current, picked)) anchor.current = null;
    seen.current = selected;
    handed.current = null;
  }
  const removes = props.removes ?? false;

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

  // F14 (§ 624): back from the view, the cell of the page that was on view comes on screen and its magnifier takes the focus.
  useLayoutEffect(() => {
    if (back.current === null || open) return;
    const cell = list.current?.querySelector<HTMLElement>(`[data-page="${back.current}"]`);
    const zoom = cell?.querySelector<HTMLElement>('.fo-page__zoom');
    if (!cell || !zoom) return;
    back.current = null;
    cell.scrollIntoView({ block: 'nearest' });
    zoom.focus({ preventScroll: true });
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
    // F14: the list is a new element when the grid comes back from the view.
  }, [size, total > 0, open === null]);
  const width = sheet > 0 ? askWidth(sheet, pixelRatio(), THUMB_CAP) : 0;

  const labelOf = (index: number): string => {
    const turn = quarters(boxes[index], turns?.[index] ?? 0) * 90;
    let label = fmt(texts.page, { n: index + 1, total });
    if (turn) label += fmt(texts.rotated, { degrees: turn });
    // F14 (item 4, § 627): in Delete a picked page is one that comes out, and its name says so.
    if (selected?.has(index)) label += removes ? texts.leaving : texts.selected;
    // F18: in Organize a page that comes out says so last (", comes out"), picked or not.
    if (out?.has(index)) label += texts.leaving;
    return mode === 'rotate' ? `${fmt(texts.turn, { n: index + 1 })} (${label})` : label;
  };

  /** The count of the grid: Organize's "{count} picked · the new PDF keeps {left} pages", or the select mode's. */
  const countNow = (count: number, gone = out?.size ?? 0): string => (organize ? markedCount(texts, count, total - gone) : countOf(texts, count, total, removes));

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

  /**
   * Shift+click and Shift+Space (§ 628): from the anchor to the page, every page takes the new state of the page, said
   * once (§ 629). Without an anchor, or on the anchor itself, it is a plain press. The page becomes the anchor.
   */
  function extend(index: number): void {
    const from = anchor.current;
    if (from === null || from === index) {
      pick(index);
      return;
    }
    const on = !selected?.has(index);
    // F18: in Organize the span is by place in the grid's order, and the sentence names its first and last pages there.
    const order = organize ? sequence : undefined;
    const pages = span(from, index, order);
    anchor.current = index;
    hand(spanned(picked, from, index, on, order));
    announce(fmt(on ? texts.spanOn : texts.spanOff, { from: (pages[0] ?? 0) + 1, to: (pages[pages.length - 1] ?? 0) + 1 }));
  }

  /** Pick all, Pick none and Invert selection: no anchor after them, and the count said once (d-2, § 629). */
  function handAll(pages: number[]): void {
    anchor.current = null;
    hand(pages);
    announce(countNow(pages.length));
  }

  // F18: the bar of Organize and the two actions of its view. Each gesture hands the new turns or pages out to the tool and
  // says one sentence; the picks and the anchor stay, so the same pages can be turned again or put back.
  /** Turns pages a quarter right (1) or left (3), on top of their turns. */
  function turnPages(pages: readonly number[], by: number): void {
    if (pages.length === 0) return;
    props.onOrganize?.({ turns: turnedBy(turns ?? {}, pages, by) });
    const one = pages.length === 1 ? (pages[0] as number) : null;
    announce(one !== null ? fmt(texts.turned, { n: one + 1, degrees: quarters(boxes[one], (turns?.[one] ?? 0) + by) * 90 }) : fmt(by === 1 ? texts.turnedRight : texts.turnedLeft, { count: pages.length }));
  }
  /** Takes the pages out, or puts them back when they all come out already: the count of what comes out is said. */
  function outPages(pages: readonly number[]): void {
    if (pages.length === 0) return;
    const next = outAfter([...(out ?? [])], pages);
    props.onOrganize?.({ out: next });
    announce(leavingCount(texts, next.length, total));
  }
  /** The picked pages in the grid's order, for the bar. */
  const pickedInOrder = (): number[] => sequence.filter((index) => selected?.has(index));

  const selectAll = () => handAll(Array.from({ length: total }, (_, i) => i));
  const selectNone = () => handAll([]);
  const invert = () => handAll(inverted(picked, total));

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
  const latest = useRef({ sequence, mode, grabbed, pick, extend, turn, move, go, columns, announce, texts, thumbnails, width });
  latest.current = { sequence, mode, grabbed, pick, extend, turn, move, go, columns, announce, texts, thumbnails, width };
  const actions = useMemo<CellActions>(
    () => ({
      press(index, position, event) {
        const now = latest.current;
        setActive(position);
        if (now.mode === 'select' || now.mode === 'organize') {
          if (event.shiftKey) now.extend(index);
          else now.pick(index);
        }
        if (now.mode === 'rotate') now.turn(index);
      },
      key(event, index, position) {
        const now = latest.current;
        // F14 (§ 628): Shift+Space is Shift+click by the keyboard. Its default is kept from the button, which would
        // press the page once more on the key's release; a held key does it once. F18: Organize picks the same way.
        if (event.key === ' ' && event.shiftKey && (now.mode === 'select' || now.mode === 'organize')) {
          event.preventDefault();
          if (!event.repeat) now.extend(index);
          return;
        }
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
        // Only the order mode picks a page up with Space and Enter; in Organize they press the button (a pick), and moving
        // by the keyboard is the arrows of the cell (F18: no key does two things).
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
      zoom(index, position) {
        // F14 (§ 624): the page view opens in the place of the grid. The cell leaves with it and lets its picture go, so
        // the grid holds that picture first and hands it to the view, which shows it until the large one comes.
        const now = latest.current;
        setActive(position);
        if (!now.thumbnails) return;
        const held = now.width > 0 ? { index, width: now.width, url: now.thumbnails.get(index, now.width) } : null;
        kept = { thumbnails: new WeakRef(now.thumbnails), index };
        setViewing({ index, thumbnails: now.thumbnails, held });
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
  if (open) {
    const action = props.view.action;
    /** What the page on view is now, said after its heading when the page changes (section A). */
    const stateOf = (index: number): string => {
      if (mode === 'rotate' || organize) {
        const degrees = quarters(boxes[index], turns?.[index] ?? 0) * 90;
        const turned = degrees ? fmt(texts.rotated, { degrees }) : '';
        // F18: Organize says the turn, the pick and that the page comes out, in the order of the cell's name.
        return organize ? turned + (selected?.has(index) ? texts.selected : '') + (out?.has(index) ? texts.leaving : '') : turned;
      }
      return mode === 'select' && selected?.has(index) ? (props.removes ? texts.leaving : texts.selected) : '';
    };
    // The action of the view goes the way of the cell's (the anchor of Shift+click included), so the grid, the count and
    // the operation change together; a pick says the count, as the batch buttons do, and a turn says its own sentence.
    // F18: in Organize, "Turn 90°" and "Take this page out" go the way of the bar, for this one page.
    const act = (which: ViewAction): void => {
      if (organize) {
        if (which === 'turn') turnPages([open.index], 1);
        else outPages([open.index]);
        return;
      }
      if (which === 'turn') {
        turn(open.index);
        return;
      }
      const count = picked.length + (selected?.has(open.index) ? -1 : 1);
      pick(open.index);
      announce(countOf(texts, count, total, removes));
    };
    return (
      <div class="fo-pages" data-mode={mode}>
        <PageView
          key="view"
          boxes={boxes}
          sequence={sequence}
          index={open.index}
          thumbnails={open.thumbnails}
          held={open.held}
          small={open.held?.width ?? (width || THUMB_WIDTH)}
          texts={props.view.texts}
          icons={icons}
          order={mode === 'order' || organize}
          turns={mode === 'rotate' || organize ? turns : undefined}
          action={action}
          pressed={organize ? out?.has(open.index) : selected?.has(open.index)}
          onAct={act}
          state={stateOf}
          announce={announce}
          resume={open.resume}
          onGo={(index) => {
            kept = { thumbnails: new WeakRef(open.thumbnails), index };
            setViewing((now) => now && { ...now, index });
          }}
          onBack={() => {
            kept = null;
            back.current = open.index;
            setActive(Math.max(0, sequence.indexOf(open.index)));
            setViewing(null);
          }}
        />
      </div>
    );
  }
  return (
    <div class="fo-pages" data-mode={mode}>
      <OptionGroup
        key="size"
        name={`${id}-size`}
        legend={texts.sizeLegend}
        value={size}
        choices={[
          { value: 'small', label: texts.sizeSmall },
          { value: 'large', label: texts.sizeLarge },
        ]}
        onChange={chooseSize}
      />
      {(mode === 'select' || organize) && (
        <div key="bar" class="fo-pages__bar">
          <p class="fo-pages__count">{countNow(selected?.size ?? 0)}</p>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={selectAll}>
            {texts.selectAll}
          </button>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={selectNone}>
            {texts.selectNone}
          </button>
          <button type="button" class="fo-btn fo-btn--ghost" onClick={invert}>
            {texts.invert}
          </button>
        </div>
      )}
      {organize && (
        // F18: the bar of actions over the picked pages, right above the grid. With no page picked its buttons stay in the
        // Tab order with aria-disabled and do nothing; the help under them, always there, says to pick pages first.
        <div key="acts" class="fo-pages__bar fo-pages__acts">
          {(['right', 'left', 'out'] as const).map((which) => {
            const none = (selected?.size ?? 0) === 0;
            const back = !none && picked.every((page) => out?.has(page));
            const run = () => (which === 'out' ? outPages(pickedInOrder()) : turnPages(pickedInOrder(), which === 'right' ? 1 : 3));
            return (
              <button key={which} type="button" class={`fo-btn fo-pages__act fo-pages__act--${which}`} aria-disabled={none ? 'true' : undefined} aria-describedby={`${id}-acts-help`} onClick={run}>
                <Icon inner={which === 'out' ? icons.trash : icons.rotate} class="fo-icon--sm" />
                {which === 'right' ? texts.turnRight : which === 'left' ? texts.turnLeft : back ? texts.putBack : texts.takeOut}
              </button>
            );
          })}
          <p class="fo-field__help" id={`${id}-acts-help`}>
            {texts.actsHelp}
          </p>
        </div>
      )}
      <ul key="list" class="fo-pages__grid" ref={list} data-size={size} aria-label={fmt(texts.label, { name })} aria-describedby={helpId}>
        {sequence.map((index, position) => (
          <PageCell
            key={index}
            index={index}
            position={position}
            mode={mode}
            label={labelOf(index)}
            selected={selected?.has(index) ?? false}
            removes={removes}
            out={organize && (out?.has(index) ?? false)}
            turn={turnOf(index)}
            ratio={sheetRatio(boxes[index], turnOf(index))}
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
      <p key="help" class="fo-field__help" id={helpId}>
        {mode === 'order' ? texts.helpKeys : texts.help}
      </p>
    </div>
  );
}
