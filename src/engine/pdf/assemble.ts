// A new document made of pages of other documents: Merge (every page of every file), the parts of Split and the result
// of Delete (F5a, decision 4). pdf-lib's copyPages copies a page and everything it references, which brings along
// pages it should not (a link to page 40 copies page 40; a form field copies the widgets of every page it has), and it
// leaves the AcroForm and the bookmarks behind. So the copy here is planned first:
//  - every page of a source maps to its new reference when it is copied, and to null when it is not, so nothing can
//    pull a page that is left out;
//  - a link to a page that is copied keeps working (a named destination becomes an explicit one); a link to a page
//    that is left out is dropped; links to the web stay;
//  - the form fields whose widgets sit on copied pages come along, pruned to those widgets; a field name already taken
//    by an earlier file gets " (2)"; the XFA form is not copied (it would describe pages that are not there);
//  - the bookmarks that point at copied pages come along, in the order of the files, pointing at the new pages;
//  - the Info dictionary and the XMP metadata of the first file, as they are: nothing of the device (DECISOES § 145).
// Self-contained: nothing here imports from outside src/engine/pdf/.

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNull,
  PDFNumber,
  PDFObjectCopier,
  PDFPage,
  PDFPageLeaf,
  PDFRef,
  PDFString,
  type PDFObject,
} from '@cantoo/pdf-lib';

export interface PageSource {
  doc: PDFDocument;
  /** 0-based page index in `doc`. */
  index: number;
}

const name = (value: string) => PDFName.of(value);

/** The text of a name or a string (destination names may be either). */
function textOf(value: PDFObject | undefined): string | null {
  if (value instanceof PDFName) return value.decodeText();
  if (value instanceof PDFString || value instanceof PDFHexString) return value.decodeText();
  return null;
}

function lookup(doc: PDFDocument, value: PDFObject | undefined): PDFObject | undefined {
  return value instanceof PDFRef ? doc.context.lookup(value) : value;
}

const namedCache = new WeakMap<PDFDocument, Map<string, PDFObject>>();

/** Every named destination of a document: the catalog's /Dests dictionary and the /Names /Dests name tree. */
function namedDestinations(doc: PDFDocument): Map<string, PDFObject> {
  const cached = namedCache.get(doc);
  if (cached) return cached;
  const found = new Map<string, PDFObject>();
  const dests = lookup(doc, doc.catalog.get(name('Dests')));
  if (dests instanceof PDFDict) {
    for (const [key, value] of dests.entries()) {
      const text = textOf(key);
      if (text !== null) found.set(text, value);
    }
  }
  const names = lookup(doc, doc.catalog.get(name('Names')));
  const tree = names instanceof PDFDict ? lookup(doc, names.get(name('Dests'))) : undefined;
  const seen = new Set<PDFObject>();
  const walk = (node: PDFObject | undefined, depth: number): void => {
    if (!(node instanceof PDFDict) || seen.has(node) || depth > 32) return;
    seen.add(node);
    const pairs = lookup(doc, node.get(name('Names')));
    if (pairs instanceof PDFArray) {
      for (let i = 0; i + 1 < pairs.size(); i += 2) {
        const text = textOf(lookup(doc, pairs.get(i)));
        if (text !== null) found.set(text, pairs.get(i + 1));
      }
    }
    const kids = lookup(doc, node.get(name('Kids')));
    if (kids instanceof PDFArray) for (const kid of kids.asArray()) walk(lookup(doc, kid), depth + 1);
  };
  walk(tree, 0);
  namedCache.set(doc, found);
  return found;
}

/** The explicit destination array a destination value stands for (an array, a name, a string, or a dict with /D). */
function explicitDestination(doc: PDFDocument, value: PDFObject | undefined, depth = 0): PDFArray | null {
  const resolved = lookup(doc, value);
  if (resolved instanceof PDFArray) return resolved;
  if (depth > 4) return null;
  if (resolved instanceof PDFDict) return explicitDestination(doc, resolved.get(name('D')), depth + 1);
  const text = textOf(resolved);
  if (text === null) return null;
  return explicitDestination(doc, namedDestinations(doc).get(text), depth + 1);
}

/** The destination of a link or a bookmark: its /Dest, or the /D of a GoTo action. Undefined when it has neither. */
function destinationOf(doc: PDFDocument, dict: PDFDict): { value: PDFObject; viaAction: boolean } | undefined {
  const dest = dict.get(name('Dest'));
  if (dest) return { value: dest, viaAction: false };
  const action = lookup(doc, dict.get(name('A')));
  if (action instanceof PDFDict && action.get(name('S')) === name('GoTo') && action.get(name('D'))) return { value: action.get(name('D')) as PDFObject, viaAction: true };
  return undefined;
}

/** Everything one source contributes, planned before a single object is copied. */
interface SourcePlan {
  doc: PDFDocument;
  dest: PDFDocument;
  copier: PDFObjectCopier;
  traversed: Map<PDFObject, PDFObject>;
  /** Original page ref to its new ref (only pages that are copied). */
  pages: Map<PDFRef, PDFRef>;
}

function traversedOf(copier: PDFObjectCopier): Map<PDFObject, PDFObject> {
  return (copier as unknown as { traversedObjects: Map<PDFObject, PDFObject> }).traversedObjects;
}

function plan(dest: PDFDocument, doc: PDFDocument): SourcePlan {
  const copier = PDFObjectCopier.for(doc.context, dest.context);
  const traversed = traversedOf(copier);
  // No page of the source and no node of its page tree is ever copied by reference: the ones the result keeps are
  // mapped below; the rest become null. The catalog too (some files point at it from a page).
  for (const page of doc.getPages()) traversed.set(page.ref, PDFNull);
  const root = doc.catalog.get(name('Pages'));
  const markTree = (ref: PDFObject | undefined, depth: number): void => {
    if (!(ref instanceof PDFRef) || depth > 64) return;
    const node = doc.context.lookup(ref);
    if (!(node instanceof PDFDict) || node instanceof PDFPageLeaf) return;
    traversed.set(ref, PDFNull);
    const kids = lookup(doc, node.get(name('Kids')));
    if (kids instanceof PDFArray) for (const kid of kids.asArray()) markTree(kid, depth + 1);
  };
  markTree(root, 0);
  for (const [ref, object] of doc.context.enumerateIndirectObjects()) if (object === doc.catalog) traversed.set(ref, PDFNull);
  return { doc, dest, copier, traversed, pages: new Map() };
}

/** A copy of `dict` in its own context with some entries changed (`undefined` deletes the key). */
function edited(dict: PDFDict, changes: Record<string, PDFObject | undefined>): PDFDict {
  const copy = dict.clone();
  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) copy.delete(name(key));
    else copy.set(name(key), value);
  }
  return copy;
}

/** Field names already used by an earlier file, so a later field with the same name is renamed. */
function uniqueFieldName(taken: Set<string>, wanted: string): string {
  let candidate = wanted;
  for (let n = 2; taken.has(candidate); n += 1) candidate = `${wanted} (${n})`;
  taken.add(candidate);
  return candidate;
}

interface OutlineItem {
  title: PDFObject;
  dest: PDFArray | null;
  color: PDFObject | undefined;
  flags: PDFObject | undefined;
  open: boolean;
  children: OutlineItem[];
}

/**
 * The bookmarks of a source that lead to copied pages (or contain one that does), with destinations already in the new
 * document. A bookmark whose own target is left out but whose children are kept stays as a heading without a target.
 */
function outlineOf(source: SourcePlan): OutlineItem[] {
  const { doc, dest, copier, pages } = source;
  const outlines = lookup(doc, doc.catalog.get(name('Outlines')));
  if (!(outlines instanceof PDFDict)) return [];
  const seen = new Set<PDFObject>();
  const items = (first: PDFObject | undefined, depth: number): OutlineItem[] => {
    const out: OutlineItem[] = [];
    let current = lookup(doc, first);
    while (current instanceof PDFDict && !seen.has(current) && depth < 32) {
      seen.add(current);
      const target = destinationOf(doc, current);
      const array = target ? explicitDestination(doc, target.value) : null;
      const page = array?.get(0);
      const newRef = page instanceof PDFRef ? pages.get(page) : undefined;
      const children = items(current.get(name('First')), depth + 1);
      if (newRef || children.length > 0) {
        const destination = newRef && array ? PDFArray.withContext(dest.context) : null;
        if (destination && array) {
          destination.push(newRef as PDFRef);
          for (let i = 1; i < array.size(); i += 1) destination.push(copier.copy(array.get(i)));
        }
        const count = lookup(doc, current.get(name('Count')));
        out.push({
          title: copier.copy(current.get(name('Title')) ?? PDFString.of('')),
          dest: destination,
          color: current.get(name('C')) ? copier.copy(current.get(name('C')) as PDFObject) : undefined,
          flags: current.get(name('F')) ? copier.copy(current.get(name('F')) as PDFObject) : undefined,
          open: count instanceof PDFNumber ? count.asNumber() > 0 : false,
          children,
        });
      }
      current = lookup(doc, current.get(name('Next')));
    }
    return out;
  };
  return items(outlines.get(name('First')), 0);
}

/** Writes the bookmark tree into the new document and hangs it off its catalog. */
function writeOutline(dest: PDFDocument, items: OutlineItem[]): void {
  if (items.length === 0) return;
  const context = dest.context;
  const rootRef = context.nextRef();
  const write = (list: OutlineItem[], parent: PDFRef): { first: PDFRef; last: PDFRef; visible: number } => {
    const refs = list.map(() => context.nextRef());
    let visible = 0;
    list.forEach((item, i) => {
      const dict = context.obj({}) as PDFDict;
      dict.set(name('Title'), item.title);
      dict.set(name('Parent'), parent);
      if (i > 0) dict.set(name('Prev'), refs[i - 1] as PDFRef);
      if (i < list.length - 1) dict.set(name('Next'), refs[i + 1] as PDFRef);
      if (item.dest) dict.set(name('Dest'), item.dest);
      if (item.color) dict.set(name('C'), item.color);
      if (item.flags) dict.set(name('F'), item.flags);
      visible += 1;
      if (item.children.length > 0) {
        const below = write(item.children, refs[i] as PDFRef);
        dict.set(name('First'), below.first);
        dict.set(name('Last'), below.last);
        dict.set(name('Count'), PDFNumber.of(item.open ? below.visible : -below.visible));
        if (item.open) visible += below.visible;
      }
      context.assign(refs[i] as PDFRef, dict);
    });
    return { first: refs[0] as PDFRef, last: refs[refs.length - 1] as PDFRef, visible };
  };
  const top = write(items, rootRef);
  context.assign(rootRef, context.obj({ Type: 'Outlines', First: top.first, Last: top.last, Count: top.visible }));
  dest.catalog.set(name('Outlines'), rootRef);
}

export interface AssembleReport {
  /** Form fields the result carries, and whether a source had an XFA form that was not copied. */
  fields: number;
  xfaDropped: boolean;
  bookmarks: number;
}

/**
 * The new document: `pages` in order (a page may come from any source). Returns pdf-lib's document, to save, and what
 * it carries.
 */
export async function assemble(pages: readonly PageSource[]): Promise<{ doc: PDFDocument; report: AssembleReport }> {
  const dest = await PDFDocument.create({ updateMetadata: false });
  const sources = new Map<PDFDocument, SourcePlan>();
  const order: SourcePlan[] = [];
  for (const { doc } of pages) {
    if (!sources.has(doc)) {
      const planned = plan(dest, doc);
      sources.set(doc, planned);
      order.push(planned);
    }
  }
  // 1. A new reference for every page that is copied (a page asked for twice is copied once).
  const leaves: { source: SourcePlan; page: PDFPage; newRef: PDFRef }[] = [];
  for (const { doc, index } of pages) {
    const source = sources.get(doc) as SourcePlan;
    const page = doc.getPage(index);
    if (source.pages.has(page.ref)) continue;
    const newRef = dest.context.nextRef();
    source.pages.set(page.ref, newRef);
    source.traversed.set(page.ref, newRef);
    leaves.push({ source, page, newRef });
  }

  // 2. Annotations of the copied pages: links to left-out pages go, named links become explicit, widgets are noted.
  const pageAnnots = new Map<PDFPage, PDFArray>();
  const keptWidgets = new Map<SourcePlan, Set<PDFRef>>();
  const rewrites: { source: SourcePlan; ref: PDFRef; dict: PDFDict }[] = [];
  for (const { source, page } of leaves) {
    if (pageAnnots.has(page)) continue;
    const { doc, pages: mapped } = source;
    const annots = lookup(doc, page.node.get(name('Annots')));
    const kept = PDFArray.withContext(doc.context);
    if (annots instanceof PDFArray) {
      for (const item of annots.asArray()) {
        const annot = lookup(doc, item);
        if (!(annot instanceof PDFDict)) continue;
        const subtype = annot.get(name('Subtype'));
        if (subtype === name('Widget') && item instanceof PDFRef) {
          const set = keptWidgets.get(source) ?? new Set<PDFRef>();
          set.add(item);
          keptWidgets.set(source, set);
        }
        if (subtype === name('Link')) {
          const target = destinationOf(doc, annot);
          if (target) {
            const array = explicitDestination(doc, target.value);
            const first = array?.get(0);
            if (!(first instanceof PDFRef) || !mapped.has(first)) continue; // a link to a page that is not here
            const named = !(lookup(doc, target.value) instanceof PDFArray);
            if (named && array && item instanceof PDFRef) {
              rewrites.push({ source, ref: item, dict: edited(annot, { Dest: array, A: target.viaAction ? undefined : annot.get(name('A')) }) });
            }
          }
        }
        kept.push(item);
      }
    }
    pageAnnots.set(page, kept);
  }

  // 3. Form fields pruned to the widgets that are copied; top-level names unique across the files.
  const takenNames = new Set<string>();
  const topFields: { source: SourcePlan; ref: PDFRef }[] = [];
  let xfaDropped = false;
  let formSource: SourcePlan | null = null;
  for (const source of order) {
    const { doc } = source;
    const form = lookup(doc, doc.catalog.get(name('AcroForm')));
    if (!(form instanceof PDFDict)) continue;
    if (form.has(name('XFA'))) xfaDropped = true;
    const fields = lookup(doc, form.get(name('Fields')));
    if (!(fields instanceof PDFArray)) continue;
    const widgets = keptWidgets.get(source) ?? new Set<PDFRef>();
    const visit = (ref: PDFObject, depth: number): boolean => {
      if (!(ref instanceof PDFRef) || depth > 32) return false;
      const field = doc.context.lookup(ref);
      if (!(field instanceof PDFDict)) return false;
      const kids = lookup(doc, field.get(name('Kids')));
      if (!(kids instanceof PDFArray)) return widgets.has(ref);
      const keptKids = kids.asArray().filter((kid) => visit(kid, depth + 1));
      if (keptKids.length === 0) return false;
      if (keptKids.length !== kids.size()) {
        const array = PDFArray.withContext(doc.context);
        for (const kid of keptKids) array.push(kid);
        rewrites.push({ source, ref, dict: edited(field, { Kids: array }) });
      }
      return true;
    };
    for (const ref of fields.asArray()) {
      if (!visit(ref, 0) || !(ref instanceof PDFRef)) continue;
      formSource ??= source;
      const field = doc.context.lookup(ref) as PDFDict;
      const own = textOf(lookup(doc, field.get(name('T'))));
      if (own !== null) {
        const unique = uniqueFieldName(takenNames, own);
        if (unique !== own) {
          const already = rewrites.find((entry) => entry.ref === ref && entry.source === source);
          const base = already ? already.dict : field;
          const renamed = edited(base, { T: PDFHexString.fromText(unique) });
          if (already) already.dict = renamed;
          else rewrites.push({ source, ref, dict: renamed });
        }
      }
      topFields.push({ source, ref });
    }
  }

  // 4. Every rewritten object gets its new reference before anything is copied, so every pointer to it lands on it.
  const assigned: { source: SourcePlan; dict: PDFDict; newRef: PDFRef }[] = [];
  for (const rewrite of rewrites) {
    const newRef = dest.context.nextRef();
    rewrite.source.traversed.set(rewrite.ref, newRef);
    assigned.push({ source: rewrite.source, dict: rewrite.dict, newRef });
  }
  for (const entry of assigned) dest.context.assign(entry.newRef, entry.source.copier.copy(entry.dict));

  // 5. The pages, in order.
  for (const { source, page, newRef } of leaves) {
    const leaf = page.node.clone() as PDFPageLeaf;
    leaf.set(name('Annots'), pageAnnots.get(page) as PDFArray);
    if ((pageAnnots.get(page) as PDFArray).size() === 0) leaf.delete(name('Annots'));
    leaf.delete(name('B')); // article beads chain to other pages
    const copied = source.copier.copy(leaf) as PDFPageLeaf;
    dest.context.assign(newRef, copied);
    dest.addPage(PDFPage.of(copied, newRef, dest));
  }

  // 6. The form, the bookmarks and the metadata of the first file.
  if (topFields.length > 0 && formSource) {
    const formDoc = formSource.doc;
    const original = lookup(formDoc, formDoc.catalog.get(name('AcroForm'))) as PDFDict;
    const form = dest.context.obj({}) as PDFDict;
    form.set(name('Fields'), dest.context.obj(topFields.map((field) => field.source.copier.copy(field.ref))));
    for (const key of ['DR', 'DA', 'Q', 'NeedAppearances']) {
      const value = original.get(name(key));
      if (value !== undefined) form.set(name(key), formSource.copier.copy(value));
    }
    dest.catalog.set(name('AcroForm'), dest.context.register(form));
  }
  const outline = order.flatMap((source) => outlineOf(source));
  writeOutline(dest, outline);
  const first = order[0];
  if (first) {
    const info = first.doc.context.trailerInfo.Info;
    if (info) dest.context.trailerInfo.Info = first.copier.copy(info);
    const metadata = first.doc.catalog.get(name('Metadata'));
    if (metadata) dest.catalog.set(name('Metadata'), first.copier.copy(metadata));
    const lang = first.doc.catalog.get(name('Lang'));
    if (lang) dest.catalog.set(name('Lang'), first.copier.copy(lang));
  }
  return { doc: dest, report: { fields: topFields.length, xfaDropped, bookmarks: outline.length } };
}
