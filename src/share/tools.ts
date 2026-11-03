// The tools a shared file can open with (F8, decisions 1 and 9; DECISOES § 290 and § 291), read from the image and
// PDF registries: only tools (no presets, no guides), what each one takes, and whether it takes one file at a time.
// The manifests build their share_target accept from here, and the "Open with" page its cards; both run at build time.
import { IMAGE_PAGES, IMAGE_TOOL_IDS, type ImageToolId } from '../tools/image/registry.ts';
import { PDF_PAGES, PDF_TOOL_IDS, type PdfToolId } from '../tools/pdf/registry.ts';
import { acceptAttribute } from '../tools/image/summary.ts';
import type { ImageFormat } from '../engine/image/types.ts';

/** A format as the "Open with" page reads it from the bytes: an image format of the engine, or a PDF. */
export type ShareFormat = ImageFormat | 'pdf';

export type ShareTool =
  | { kind: 'image'; id: ImageToolId; accepts: readonly ShareFormat[]; single: false }
  | { kind: 'pdf'; id: PdfToolId; accepts: readonly ShareFormat[]; single: boolean };

export const SHARE_TOOLS: readonly ShareTool[] = [
  ...IMAGE_TOOL_IDS.map((id): ShareTool => ({ kind: 'image', id, accepts: IMAGE_PAGES[id].accepts, single: false })),
  ...PDF_TOOL_IDS.map((id): ShareTool => ({ kind: 'pdf', id, accepts: ['pdf'], single: PDF_PAGES[id].files === 'single' })),
];

/** The accept of the share_target: every type and extension some image or PDF tool takes (HEIC included). */
export function shareAccept(): string[] {
  const images = [...new Set(SHARE_TOOLS.flatMap((tool) => tool.accepts).filter((format): format is ImageFormat => format !== 'pdf'))];
  return [...new Set([...acceptAttribute(images).split(','), 'application/pdf', '.pdf'])];
}
