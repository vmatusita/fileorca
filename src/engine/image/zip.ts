// A ZIP of the batch outputs, with the files stored (not compressed: they are JPEG, PNG, WebP or
// AVIF already). fflate's streaming Zip with ZipPassThrough builds it in the worker without a nested
// worker and without copying the data into one big buffer: the Blob is made from the chunks.
// The names must already be unique; the date is fixed (the ZIP epoch), so the file says nothing
// about when it was made.
// Self-contained: nothing here imports from outside src/engine/image/.

import { Zip, ZipPassThrough } from 'fflate';

export interface ZipEntry {
  name: string;
  blob: Blob;
}

const ZIP_EPOCH = new Date(1980, 0, 1, 0, 0, 0);

export async function zipStored(entries: readonly ZipEntry[]): Promise<Blob> {
  const parts: Uint8Array[] = [];
  const finished = new Promise<void>((resolve, reject) => {
    const zip = new Zip((error, chunk, final) => {
      if (error) {
        reject(error);
        return;
      }
      parts.push(chunk);
      if (final) resolve();
    });
    // Entries are read one by one so the memory held is the outputs plus one copy, not two.
    void (async () => {
      try {
        for (const entry of entries) {
          const file = new ZipPassThrough(entry.name);
          file.mtime = ZIP_EPOCH;
          zip.add(file);
          file.push(new Uint8Array(await entry.blob.arrayBuffer()), true);
        }
        zip.end();
      } catch (error) {
        reject(error);
      }
    })();
  });
  await finished;
  return new Blob(parts as BlobPart[], { type: 'application/zip' });
}
