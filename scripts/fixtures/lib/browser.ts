// Chromium (and WebKit, for the checks) as the drawing and encoding tool of the fixture generator:
// canvas + toBlob inside page.evaluate, bytes in and out as base64. The point of using the browser is
// that the pixels and the first encode do not come from the code the engine uses (jSquash).
import { chromium, webkit, type Browser, type Page } from '@playwright/test';
import { fromBase64, toBase64, type Rgba } from './rgba.ts';

interface Probe {
  ok: boolean;
  width: number;
  height: number;
  error: string;
}

interface Fx {
  decode(base64: string, mime: string, width: number, height: number): Promise<{ width: number; height: number; rgba: string }>;
  encode(rgba: string, width: number, height: number, mime: string, quality: number): Promise<string>;
  probe(base64: string, mime: string): Promise<Probe>;
  thumb(base64: string, mime: string, n: number): Promise<number[]>;
  alphaAt(base64: string, mime: string, points: number[][]): Promise<number[]>;
  frame(width: number, height: number, background: string, accent: string, quality: number): Promise<string>;
  big(width: number, height: number, seed: number, quality: number): Promise<string>;
}

declare global {
  interface Window {
    fx: Fx;
  }
}

/** Runs in the page. Self-contained on purpose: Playwright sends its source text, nothing is captured. */
function installBrowserLib(): void {
  const toBytes = (base64: string): Uint8Array => {
    const binary = atob(base64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  };
  const toText = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };
  const surface = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('no 2d context');
    return { canvas, context };
  };
  const blobOf = (base64: string, mime: string): Blob => new Blob([toBytes(base64) as BlobPart], { type: mime });
  const encodeCanvas = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<string> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('toBlob returned null'));
          if (blob.type !== mime) return reject(new Error(`asked for ${mime}, got ${blob.type}`));
          blob.arrayBuffer().then((buffer) => resolve(toText(new Uint8Array(buffer))), reject);
        },
        mime,
        quality,
      );
    });
  const mulberry32 = (seed: number): (() => number) => {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  window.fx = {
    async decode(base64, mime, width, height) {
      const bitmap = await createImageBitmap(blobOf(base64, mime), { imageOrientation: 'from-image' });
      const w = width || bitmap.width;
      const h = height || bitmap.height;
      const { context } = surface(w, h);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();
      const pixels = context.getImageData(0, 0, w, h);
      return { width: w, height: h, rgba: toText(new Uint8Array(pixels.data.buffer)) };
    },
    async encode(rgba, width, height, mime, quality) {
      const { canvas, context } = surface(width, height);
      context.putImageData(new ImageData(new Uint8ClampedArray(toBytes(rgba).buffer as ArrayBuffer), width, height), 0, 0);
      return encodeCanvas(canvas, mime, quality);
    },
    async probe(base64, mime) {
      try {
        const bitmap = await createImageBitmap(blobOf(base64, mime), { imageOrientation: 'from-image' });
        const result = { ok: true, width: bitmap.width, height: bitmap.height, error: '' };
        bitmap.close();
        return result;
      } catch (error) {
        return { ok: false, width: 0, height: 0, error: String(error) };
      }
    },
    async thumb(base64, mime, n) {
      const bitmap = await createImageBitmap(blobOf(base64, mime), { imageOrientation: 'from-image' });
      const scale = 4;
      const { context } = surface(n * scale, n * scale);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, n * scale, n * scale);
      bitmap.close();
      const pixels = context.getImageData(0, 0, n * scale, n * scale).data;
      const out: number[] = [];
      for (let ty = 0; ty < n; ty += 1) {
        for (let tx = 0; tx < n; tx += 1) {
          let sum = 0;
          for (let y = 0; y < scale; y += 1) {
            for (let x = 0; x < scale; x += 1) {
              const i = ((ty * scale + y) * n * scale + tx * scale + x) * 4;
              sum += 0.299 * (pixels[i] as number) + 0.587 * (pixels[i + 1] as number) + 0.114 * (pixels[i + 2] as number);
            }
          }
          out.push(sum / (scale * scale));
        }
      }
      return out;
    },
    async alphaAt(base64, mime, points) {
      const bitmap = await createImageBitmap(blobOf(base64, mime), { imageOrientation: 'from-image' });
      const { context } = surface(1, 1);
      const out: number[] = [];
      for (const [x, y] of points) {
        context.clearRect(0, 0, 1, 1);
        context.drawImage(bitmap, x as number, y as number, 1, 1, 0, 0, 1, 1);
        out.push(context.getImageData(0, 0, 1, 1).data[3] as number);
      }
      bitmap.close();
      return out;
    },
    // Two frames of the animated WebP: a flat field with a white band and a ring, so they differ at a glance.
    async frame(width, height, background, accent, quality) {
      const { canvas, context } = surface(width, height);
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.moveTo(0, height * 0.7);
      context.lineTo(width, height * 0.2);
      context.lineTo(width, height * 0.35);
      context.lineTo(0, height * 0.85);
      context.closePath();
      context.fill();
      context.strokeStyle = accent;
      context.lineWidth = 18;
      context.beginPath();
      context.arc(width * 0.5, height * 0.5, height * 0.28, 0, Math.PI * 2);
      context.stroke();
      return encodeCanvas(canvas, 'image/webp', quality);
    },
    // Simple content on purpose (a gradient and flat blocks): 16.8 MP that encodes small and decodes fast.
    async big(width, height, seed, quality) {
      const { canvas, context } = surface(width, height);
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#16324f');
      gradient.addColorStop(1, '#f0e1b4');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      const random = mulberry32(seed);
      const palette = ['#c0392b', '#2e86c1', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1'];
      const cell = Math.floor(width / 5);
      for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          context.fillStyle = palette[Math.floor(random() * palette.length)] as string;
          context.fillRect(Math.floor(cell * 0.5) + column * cell + 40, Math.floor(cell * 0.5) + row * cell + 40, cell - 80, cell - 80);
        }
      }
      context.fillStyle = '#101010';
      context.fillRect(0, height - 160, width, 40);
      return encodeCanvas(canvas, 'image/jpeg', quality);
    },
  };
}

export class BrowserSession {
  readonly name: string;
  readonly version: string;
  private readonly browser: Browser;
  private readonly page: Page;

  // Plain fields: Node runs this file with type stripping, which has no parameter properties.
  private constructor(name: string, version: string, browser: Browser, page: Page) {
    this.name = name;
    this.version = version;
    this.browser = browser;
    this.page = page;
  }

  static async open(kind: 'chromium' | 'webkit'): Promise<BrowserSession> {
    const type = kind === 'chromium' ? chromium : webkit;
    // Software rasterisation: the same pixels whatever GPU the machine has.
    const browser = await type.launch(kind === 'chromium' ? { args: ['--disable-gpu'] } : {});
    const page = await browser.newPage();
    await page.goto('about:blank');
    await page.evaluate(installBrowserLib);
    return new BrowserSession(kind, browser.version(), browser, page);
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  /**
   * Decodes the image and returns its pixels, scaled to width x height when given (0 = natural size).
   * The browser applies the Exif Orientation: imageOrientation 'none' is only a legacy alias of
   * 'from-image' in Chromium and WebKit (measured, both). To get the STORED pixels of a JPEG, patch its
   * Orientation to 1 first.
   */
  async decode(bytes: Uint8Array, mime: string, width = 0, height = 0): Promise<Rgba> {
    const result = await this.page.evaluate(([b64, m, w, h]) => window.fx.decode(b64 as string, m as string, w as number, h as number), [toBase64(bytes), mime, width, height] as const);
    return { width: result.width, height: result.height, data: new Uint8ClampedArray(fromBase64(result.rgba)) };
  }

  async encode(image: Rgba, mime: string, quality: number): Promise<Uint8Array> {
    const result = await this.page.evaluate(([rgba, w, h, m, q]) => window.fx.encode(rgba as string, w as number, h as number, m as string, q as number), [toBase64(image.data), image.width, image.height, mime, quality] as const);
    return fromBase64(result);
  }

  async probe(bytes: Uint8Array, mime: string): Promise<Probe> {
    return this.page.evaluate(([b64, m]) => window.fx.probe(b64 as string, m as string), [toBase64(bytes), mime] as const);
  }

  async thumb(bytes: Uint8Array, mime: string, n: number): Promise<number[]> {
    return this.page.evaluate(([b64, m, size]) => window.fx.thumb(b64 as string, m as string, size as number), [toBase64(bytes), mime, n] as const);
  }

  async alphaAt(bytes: Uint8Array, mime: string, points: number[][]): Promise<number[]> {
    return this.page.evaluate(([b64, m, p]) => window.fx.alphaAt(b64 as string, m as string, p as number[][]), [toBase64(bytes), mime, points] as const);
  }

  async frame(width: number, height: number, background: string, accent: string, quality: number): Promise<Uint8Array> {
    return fromBase64(await this.page.evaluate(([w, h, b, a, q]) => window.fx.frame(w as number, h as number, b as string, a as string, q as number), [width, height, background, accent, quality] as const));
  }

  async big(width: number, height: number, seed: number, quality: number): Promise<Uint8Array> {
    return fromBase64(await this.page.evaluate(([w, h, s, q]) => window.fx.big(w, h, s, q), [width, height, seed, quality] as const));
  }
}
