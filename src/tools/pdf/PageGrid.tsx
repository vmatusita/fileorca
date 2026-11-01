// The page grid (F5a, decision 6; DECISOES § 152): one cell per page, with a small picture drawn only while the cell
// is on screen and let go when it leaves. Three uses:
//  - select: the cell is a toggle (aria-pressed), Space or a click picks it (Split, Delete, Sign, PDF pages);
//  - order: the cell moves with the pointer (drag), with its "earlier" and "later" buttons (WCAG 2.5.7: no drag needed)
//    and with the keyboard (Space picks the page up, the arrow keys move it, Space drops it) (Reorder);
//  - rotate: the cell turns its page a quarter clockwise (Rotate, page by page).
// One tab stop for the whole grid (roving focus: arrow keys, Home, End); the move buttons of the focused cell are in
// the tab order too. Every change is said once through the panel's status region, and the focus follows a moved page,
// so it never falls on the page. The look is the FileCard's: stroke, radius and the dog-ear in the PDF colour.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { TargetedKeyboardEvent } from 'preact';
import type { PageBox } from '../../engine/pdf/types.ts';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import Icon from '../../icons/Icon.tsx';
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
  selected?: ReadonlySet<number>;
  onToggle?: (index: number) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  /** Page indices in their current order (order mode). */
  order?: readonly number[];
  onMove?: (from: number, to: number) => void;
  /** Quarter turns added to each page (rotate mode). */
  turns?: Readonly<Record<number, number>>;
  onTurn?: (index: number) => void;
}

/** Pixel width of the pictures (twice the 120 px of the cell, for sharp screens). */
export const THUMB_WIDTH = 240;

function Thumb({ index, thumbnails, turn }: { index: number; thumbnails: Thumbnails | null; turn: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const holder = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = holder.current;
    if (!element || !thumbnails) return undefined;
    let alive = true;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void thumbnails.get(index).then((value) => {
              if (alive) setUrl(value);
            });
          } else {
            thumbnails.drop(index);
            setUrl(null);
          }
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(element);
    return () => {
      alive = false;
      observer.disconnect();
      thumbnails.drop(index);
    };
  }, [index, thumbnails]);
  return (
    <span class="fo-page__sheet" ref={holder}>
      {url && <img src={url} alt="" draggable={false} style={turn ? `rotate:${turn * 90}deg` : undefined} />}
    </span>
  );
}

export default function PageGrid(props: PageGridProps) {
  const { id, name, boxes, mode, texts, icons, thumbnails, announce, selected, order, turns } = props;
  const total = boxes.length;
  const sequence = mode === 'order' && order ? order : boxes.map((_, i) => i);
  const [active, setActive] = useState(0);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const focusAfter = useRef<number | null>(null);
  const dragging = useRef<number | null>(null);

  useEffect(() => {
    if (focusAfter.current === null) return;
    list.current?.querySelector<HTMLElement>(`[data-position="${focusAfter.current}"] .fo-page__main`)?.focus();
    focusAfter.current = null;
  });

  const labelOf = (index: number): string => {
    const turn = (((boxes[index]?.rotate ?? 0) + (turns?.[index] ?? 0) * 90) % 360 + 360) % 360;
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

  function move(from: number, to: number): void {
    if (to < 0 || to >= sequence.length || from === to) return;
    props.onMove?.(from, to);
    focusAfter.current = to;
    setActive(to);
    announce(fmt(texts.moved, { n: (sequence[from] ?? 0) + 1, position: to + 1 }));
  }

  function onKey(event: TargetedKeyboardEvent<HTMLButtonElement>, position: number): void {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns(), ArrowDown: columns() };
    if (event.key in step) {
      event.preventDefault();
      const target = Math.min(sequence.length - 1, Math.max(0, position + (step[event.key] as number)));
      if (grabbed !== null) move(position, target);
      else {
        setActive(target);
        focusAfter.current = target;
      }
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : sequence.length - 1;
      if (grabbed !== null) move(position, target);
      else {
        setActive(target);
        focusAfter.current = target;
      }
      return;
    }
    if ((event.key === ' ' || event.key === 'Enter') && mode === 'order') {
      event.preventDefault();
      if (grabbed === null) {
        setGrabbed(sequence[position] ?? null);
        announce(fmt(texts.picked, { n: (sequence[position] ?? 0) + 1 }));
      } else {
        setGrabbed(null);
        announce(fmt(texts.moved, { n: grabbed + 1, position: position + 1 }));
      }
    }
    if (event.key === 'Escape' && grabbed !== null) setGrabbed(null);
  }

  function activate(index: number, position: number): void {
    setActive(position);
    if (mode === 'select') props.onToggle?.(index);
    if (mode === 'rotate') {
      props.onTurn?.(index);
      const turn = (((boxes[index]?.rotate ?? 0) + ((turns?.[index] ?? 0) + 1) * 90) % 360 + 360) % 360;
      announce(fmt(texts.turned, { n: index + 1, degrees: turn }));
    }
  }

  const helpId = `${id}-help`;
  return (
    <div class="fo-pages" data-mode={mode}>
      {mode === 'select' && (
        <div class="fo-pages__bar">
          <p class="fo-pages__count">{fmt(texts.selectedCount, { count: selected?.size ?? 0, total })}</p>
          <button type="button" class="fo-btn fo-btn--sm fo-btn--ghost" onClick={props.onSelectAll}>
            {texts.selectAll}
          </button>
          <button type="button" class="fo-btn fo-btn--sm fo-btn--ghost" onClick={props.onSelectNone}>
            {texts.selectNone}
          </button>
        </div>
      )}
      <ul class="fo-pages__grid" ref={list} aria-label={fmt(texts.label, { name })} aria-describedby={helpId}>
        {sequence.map((index, position) => {
          const box = boxes[index];
          const shown = box && (box.rotate === 90 || box.rotate === 270) ? { w: box.height, h: box.width } : { w: box?.width ?? 1, h: box?.height ?? 1 };
          const isActive = position === Math.min(active, sequence.length - 1);
          const isSelected = selected?.has(index) ?? false;
          return (
            <li
              key={index}
              class="fo-page fo-dogear fo-cat--pdf"
              data-position={position}
              data-selected={isSelected ? 'true' : undefined}
              data-grabbed={grabbed === index ? 'true' : undefined}
              style={`--page-ratio:${(shown.w / shown.h).toFixed(4)}`}
              draggable={mode === 'order'}
              onDragStart={(event) => {
                dragging.current = position;
                event.dataTransfer?.setData('text/plain', String(index + 1));
              }}
              onDragOver={(event) => {
                if (dragging.current !== null) event.preventDefault();
              }}
              onDrop={(event) => {
                if (dragging.current === null) return;
                event.preventDefault();
                move(dragging.current, position);
                dragging.current = null;
              }}
              onDragEnd={() => {
                dragging.current = null;
              }}
            >
              <button
                type="button"
                class="fo-page__main"
                tabindex={isActive ? 0 : -1}
                aria-pressed={mode === 'select' ? isSelected : mode === 'order' ? grabbed === index : undefined}
                aria-label={labelOf(index)}
                onClick={() => activate(index, position)}
                onKeyDown={(event) => onKey(event, position)}
                onFocus={() => setActive(position)}
              >
                <Thumb index={index} thumbnails={thumbnails} turn={turns?.[index] ?? 0} />
                <span class="fo-page__n" aria-hidden="true">
                  {index + 1}
                </span>
                {mode === 'rotate' && (
                  <span class="fo-page__badge" aria-hidden="true">
                    <Icon inner={icons.rotate} class="fo-icon--sm" />
                  </span>
                )}
              </button>
              {mode === 'order' && (
                <span class="fo-page__moves">
                  <button
                    type="button"
                    class="fo-btn fo-btn--icon fo-btn--ghost fo-page__move fo-page__move--back"
                    tabindex={isActive ? 0 : -1}
                    aria-label={fmt(texts.moveEarlier, { n: index + 1 })}
                    disabled={position === 0}
                    onClick={() => move(position, position - 1)}
                  >
                    <Icon inner={icons.chevron} class="fo-icon--sm" />
                  </button>
                  <button
                    type="button"
                    class="fo-btn fo-btn--icon fo-btn--ghost fo-page__move"
                    tabindex={isActive ? 0 : -1}
                    aria-label={fmt(texts.moveLater, { n: index + 1 })}
                    disabled={position === sequence.length - 1}
                    onClick={() => move(position, position + 1)}
                  >
                    <Icon inner={icons.chevron} class="fo-icon--sm" />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p class="fo-field__help" id={helpId}>
        {mode === 'order' ? texts.helpOrder : texts.help}
      </p>
    </div>
  );
}
