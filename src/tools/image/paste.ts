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

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number', '']);
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
