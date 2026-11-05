// Paste and drop helpers of the image island: which files a clipboard or a drop carries, and the
// places where Ctrl+V must not be taken over (a text field, the search, a dialog). Small functions
// over DOM types so a test can hand them plain objects.

/** The image files of a clipboard or a drop (an item without a file, or a file that is no image, is skipped). */
export function imageFilesOf(list: FileList | readonly File[] | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list as ArrayLike<File>).filter((file) => file.type === '' || file.type.startsWith('image/'));
}

/** Every file of a drop, whatever its type: the engine reads the bytes and says why a file is refused. */
export function filesOf(list: FileList | null | undefined): File[] {
  return list ? Array.from(list) : [];
}

/** True when the drag carries files (not text or a link): the page then keeps the browser from opening them. */
export function carriesFiles(transfer: DataTransfer | null | undefined): boolean {
  return !!transfer && Array.from(transfer.types ?? []).includes('Files');
}

/** How many files a drag carries, known on dragenter (the files themselves are not readable until the drop). */
export function dragCount(transfer: DataTransfer | null | undefined): number {
  if (!transfer) return 0;
  return Array.from(transfer.items ?? []).filter((item) => item.kind === 'file').length;
}

/** What a page with a file tool does with a drag of files anywhere on it (UX-18 A). */
export interface DropHandlers {
  /** Files came into the window (the count of a drag that says it, else 0): the DropZone goes to "over" where it is. */
  enter(count: number): void;
  /** They left the window, or went over an ad (a frame of another origin gets the drag): the zone goes back to rest. */
  leave(): void;
  /** They were let go anywhere on the page: the tool takes them. */
  drop(files: File[]): void;
}

/**
 * F13a · UX-18 A (DECISOES § 501 and § 502): a drag of files anywhere on the page is the tool's, in both islands.
 * The document listens; a counter of dragenter (+1) and dragleave (−1) says when the drag left the window or went over an
 * ad, instead of the relatedTarget, which Safari leaves null on every dragleave; drop and dragend set it to zero. A drag
 * of text or of a page of the grid (no "Files" in it) is never touched. Returns what stops listening, and a reset for a
 * batch that starts with no drop (the picker, a paste).
 */
export function catchDrops(on: DropHandlers): { stop: () => void; reset: () => void } {
  let depth = 0;
  // F13a, revisão c-2 (DECISOES § F13A-R-07): the nodes a drag of files came in over. The zone in "over" takes the Choose
  // button and the words of the help out of the DOM, and Chromium sends no dragleave to a node that is gone: a node that
  // left the DOM stops counting at the next dragenter or dragleave, or the zone stayed in "over" after the drag left.
  const entered = new Set<EventTarget>();
  const prune = () => {
    for (const node of entered) {
      if (typeof Node !== 'undefined' && node instanceof Node && !node.isConnected) {
        entered.delete(node);
        depth = Math.max(0, depth - 1);
      }
    }
  };
  const enter = (event: DragEvent) => {
    if (!carriesFiles(event.dataTransfer)) return;
    event.preventDefault();
    prune();
    depth += 1;
    if (event.target) entered.add(event.target);
    on.enter(dragCount(event.dataTransfer));
  };
  const over = (event: DragEvent) => {
    if (!carriesFiles(event.dataTransfer)) return;
    // The cursor says "copy" only where the page takes the file (F10 p-11): here, the whole page does.
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  };
  // Any dragleave counts down (a drag that left says so even when its event carries no list of types); the count never goes
  // under zero, so the leave of a drag of text, which never counted up, changes nothing.
  const leave = (event: DragEvent) => {
    if (event.target) entered.delete(event.target);
    depth = Math.max(0, depth - 1);
    prune();
    if (depth === 0) on.leave();
  };
  const end = () => {
    depth = 0;
    entered.clear();
    on.leave();
  };
  const drop = (event: DragEvent) => {
    if (!carriesFiles(event.dataTransfer)) return;
    event.preventDefault();
    end();
    on.drop(filesOf(event.dataTransfer?.files));
  };
  const pairs = [['dragenter', enter], ['dragover', over], ['dragleave', leave], ['drop', drop], ['dragend', end]] as const;
  for (const [type, listener] of pairs) document.addEventListener(type, listener as EventListener);
  return {
    stop: () => {
      for (const [type, listener] of pairs) document.removeEventListener(type, listener as EventListener);
    },
    reset: () => {
      depth = 0;
      entered.clear();
    },
  };
}

/** Brings the panel into view after a drop away from it, at once when the person asked for less motion. */
export function bringIntoView(element: HTMLElement | null): void {
  if (!element) return;
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
}

const TEXT_INPUT_TYPES =new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number', '']);
const DIALOGS = 'dialog[open], [role="dialog"], .fo-search, #fo-search-dialog';
const FIELDS = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

type FieldLike = { closest?: (selector: string) => FieldLike | null; tagName?: string; type?: string };

/**
 * Whether a paste aimed at `target` belongs to that element: a text field, a select, an editable
 * area, the tool search, or anything inside an open dialog. The tool then leaves the paste alone.
 * (Duck-typed on closest(), so a test can hand it a plain object.)
 */
export function pasteBelongsToElement(target: EventTarget | null): boolean {
  const element = target as FieldLike | null;
  if (!element || typeof element.closest !== 'function') return false;
  if (element.closest(DIALOGS)) return true;
  const field = element.closest(FIELDS);
  if (!field) return false;
  return field.tagName === 'INPUT' ? TEXT_INPUT_TYPES.has((field.type ?? '').toLowerCase()) : true;
}
