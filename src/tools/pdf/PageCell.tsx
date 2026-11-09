// One cell of the page grid (F14; DECISOES § 618, § 620 and § 621). It draws again only when its own state changes:
// its props are plain values, and the functions it calls come in one object made once per grid (`actions`), which reads
// the grid's latest state through a ref. A press on one page of a 300-page file used to draw the 300 cells again (PENDENCIAS
// F5a E-2); now it draws the one that changed. No `preact/compat` (its `memo` would grow the island): a class with
// `shouldComponentUpdate` does the same.
//
// The sheet has the shape of the page as it will come out (its box, its /Rotate and the person's turns), set before the
// picture arrives, so the picture changes no height (§ 618). The magnifier is a sibling of the page's button, in the line
// of the number on the right, never over the picture (§ 621).
import { Component } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren, TargetedDragEvent, TargetedFocusEvent, TargetedKeyboardEvent, TargetedMouseEvent } from 'preact';
import type { PdfPanelTexts } from '../../i18n/types.ts';
import { fmt } from '../../i18n/format.ts';
import Icon from '../../icons/Icon.tsx';
import type { PdfIcons, Thumbnails } from './types.ts';
import checkIcon from '../../../docs/design/assets/Icons/check.svg?raw';

/** What a cell asks of its grid. Made once per grid: the identity never changes, so it never draws a cell again. */
export interface CellActions {
  press(index: number, position: number, event: TargetedMouseEvent<HTMLButtonElement>): void;
  key(event: TargetedKeyboardEvent<HTMLButtonElement>, index: number, position: number): void;
  focus(position: number): void;
  blur(index: number, position: number, event: TargetedFocusEvent<HTMLButtonElement>): void;
  move(from: number, to: number): void;
  zoom(index: number, position: number): void;
  dragStart(index: number, position: number, event: TargetedDragEvent<HTMLLIElement>): void;
  dragOver(event: TargetedDragEvent<HTMLLIElement>): void;
  drop(position: number, event: TargetedDragEvent<HTMLLIElement>): void;
  dragEnd(): void;
}

export interface PageCellProps {
  /** The page in the file (0-based) and its place in the grid. */
  index: number;
  position: number;
  mode: 'select' | 'order' | 'rotate';
  /** The name of the page's button, already put together by the grid. */
  label: string;
  selected: boolean;
  /** The grid of Delete: a picked page is one that comes out (F14, item 4). */
  removes: boolean;
  /** Quarter turns the person added (rotate mode). */
  turn: number;
  /** Width over height of the sheet. */
  ratio: number;
  active: boolean;
  grabbed: boolean;
  first: boolean;
  last: boolean;
  /** Width in pixels asked of the thumbnail cache (0 until the grid has measured its sheets). */
  width: number;
  thumbnails: Thumbnails | null;
  texts: PdfPanelTexts['grid'];
  icons: PdfIcons;
  actions: CellActions;
}

function Thumb({ index, thumbnails, turn, ratio, width, children }: { index: number; thumbnails: Thumbnails | null; turn: number; ratio: number; width: number; children?: ComponentChildren }) {
  const [url, setUrl] = useState<string | null>(null);
  const holder = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = holder.current;
    if (!element || !thumbnails || width <= 0) return undefined;
    // Each stay on screen asks once and lets go once, with the same width. An answer that comes after its stay ended is
    // dropped: the cache already let that URL go, and an <img> on it would be broken (DECISOES § 180). A new width (the
    // person chose Large, or the window changed the sheet) ends the stay: the picture of the old width goes (§ 619).
    let stay = 0;
    let held = false;
    const leave = () => {
      stay += 1;
      if (held) thumbnails.drop(index, width);
      held = false;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (held) continue;
            held = true;
            const mine = ++stay;
            void thumbnails.get(index, width).then((value) => {
              if (mine === stay) setUrl(value);
            });
          } else {
            leave();
            setUrl(null);
          }
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      leave();
      setUrl(null);
    };
  }, [index, thumbnails, width]);
  const quarter = ((turn % 4) + 4) % 4;
  return (
    <span class="fo-page__sheet" ref={holder} style={`--sheet-ratio:${ratio.toFixed(4)}`}>
      {url && <img src={url} alt="" draggable={false} data-turn={quarter || undefined} style={quarter ? `rotate:${quarter * 90}deg` : undefined} />}
      {children}
    </span>
  );
}

const KEYS: readonly (keyof PageCellProps)[] = ['index', 'position', 'mode', 'label', 'selected', 'removes', 'turn', 'ratio', 'active', 'grabbed', 'first', 'last', 'width', 'thumbnails', 'texts', 'icons', 'actions'];

export default class PageCell extends Component<PageCellProps> {
  override shouldComponentUpdate(next: PageCellProps): boolean {
    return KEYS.some((key) => this.props[key] !== next[key]);
  }

  override render() {
    const { index, position, mode, label, selected, turn, ratio, active, grabbed, first, last, width, thumbnails, texts, icons, actions } = this.props;
    return (
      <li
        class="fo-page fo-dogear fo-cat--pdf"
        data-position={position}
        data-page={index}
        data-selected={selected ? 'true' : undefined}
        data-grabbed={grabbed ? 'true' : undefined}
        draggable={mode === 'order'}
        onDragStart={(event) => actions.dragStart(index, position, event)}
        onDragOver={(event) => actions.dragOver(event)}
        onDrop={(event) => actions.drop(position, event)}
        onDragEnd={() => actions.dragEnd()}
      >
        <button
          type="button"
          class="fo-page__main"
          tabindex={active ? 0 : -1}
          aria-pressed={mode === 'select' ? selected : mode === 'order' ? grabbed : undefined}
          aria-label={label}
          onClick={(event) => actions.press(index, position, event)}
          onKeyDown={(event) => actions.key(event, index, position)}
          onFocus={() => actions.focus(position)}
          onBlur={(event) => actions.blur(index, position, event)}
        >
          <Thumb index={index} thumbnails={thumbnails} turn={mode === 'rotate' ? turn : 0} ratio={ratio} width={width}>
            {mode === 'rotate' && (
              <span class="fo-page__badge" aria-hidden="true">
                <Icon inner={icons.rotate} class="fo-icon--sm" />
              </span>
            )}
          </Thumb>
          {/* F13a (D-7): a picked page has the check in a brand circle before its number, not only the colour of its border. */}
          <span class="fo-page__n" aria-hidden="true">
            {mode === 'select' && (
              <span class="fo-page__check">
                <Icon raw={checkIcon} />
              </span>
            )}
            {index + 1}
          </span>
        </button>
        {/* F14 (§ 621): the magnifier opens the page large; only the active cell's is in the Tab order, like the arrows. */}
        <button
          type="button"
          class="fo-btn fo-btn--icon fo-page__zoom"
          tabindex={active ? 0 : -1}
          aria-label={fmt(texts.zoom, { n: index + 1 })}
          onClick={() => actions.zoom(index, position)}
          onFocus={() => actions.focus(position)}
        >
          <Icon inner={icons.zoom} />
        </button>
        {mode === 'order' && (
          <span class="fo-page__moves">
            <button
              type="button"
              class="fo-btn fo-btn--icon fo-page__move fo-page__move--back"
              tabindex={active ? 0 : -1}
              aria-label={fmt(texts.moveEarlier, { n: index + 1 })}
              disabled={first}
              onClick={() => actions.move(position, position - 1)}
            >
              <Icon inner={icons.chevron} class="fo-icon--sm" />
            </button>
            <button
              type="button"
              class="fo-btn fo-btn--icon fo-page__move"
              tabindex={active ? 0 : -1}
              aria-label={fmt(texts.moveLater, { n: index + 1 })}
              disabled={last}
              onClick={() => actions.move(position, position + 1)}
            >
              <Icon inner={icons.chevron} class="fo-icon--sm" />
            </button>
          </span>
        )}
      </li>
    );
  }
}
