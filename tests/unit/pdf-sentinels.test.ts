// The search of the privacy test of the PDF tools (tests/e2e/lib/sentinels.ts), proven to find what it must and to stay
// quiet otherwise: the browser test is only as good as these controls (F5a, decision 8).
import { describe, expect, it } from 'vitest';
import { SENTINELS, brokenRequests, bytesHold, holds, leaksIn, requestText, variants, type SeenRequest } from '../e2e/lib/sentinels.ts';

const request = (patch: Partial<SeenRequest> = {}): SeenRequest => ({ method: 'GET', url: 'http://127.0.0.1:4173/merge-pdf/', headers: {}, body: '', bodyBytes: 0, ...patch });

describe('holds', () => {
  it('finds a long sentinel however it is dressed, even with characters glued to both sides', () => {
    const dressed: [string, string][] = [
      [SENTINELS.password, SENTINELS.password],
      [`password=${SENTINELS.password}&x=1`, SENTINELS.password],
      [`xx${SENTINELS.password}yy`, SENTINELS.password],
      [`{"password":"${SENTINELS.password}"}`, SENTINELS.password],
      [`?q=${encodeURIComponent(SENTINELS.rangeSplit)}`, SENTINELS.rangeSplit],
      [`?q=${SENTINELS.rangeSplit}`, SENTINELS.rangeSplit],
      [`#${SENTINELS.rangeSplit.replace(/\s+/g, '')}`, SENTINELS.rangeSplit],
    ];
    for (const [text, sentinel] of dressed) expect(holds(text, sentinel), text).toBe(true);
  });

  it('finds the same text with its spaces gone or percent-encoded, which is how a range travels in an address', () => {
    for (const sentinel of [SENTINELS.rangeSplit, SENTINELS.rangeDelete, SENTINELS.rangeImages]) {
      for (const form of variants(sentinel)) expect(holds(`https://x.test/p?r=${form}`, sentinel), form).toBe(true);
    }
  });

  it('finds the short number as a whole word only: a hash that happens to hold the digits is not a leak', () => {
    for (const text of ['start=8317', '"start":8317}', '/numbers/8317/', 'n 8317.', '8317']) expect(holds(text, SENTINELS.start), text).toBe(true);
    for (const text of ['/_astro/x8317Kq2.js', 'abc-83179', 'id18317', '83170', '8318', 'a8317']) expect(holds(text, SENTINELS.start), text).toBe(false);
  });

  it('says nothing about text that does not hold a sentinel, or holds only a part of one', () => {
    for (const text of ['', 'GET /merge-pdf/', 'Orca-Sentinel-7391', 'Sentinel-7391-Kq', 'Orca-Inside-3319', '1-2, 4, 6-7', 'Page 1 of 12']) {
      for (const sentinel of Object.values(SENTINELS)) expect(holds(text, sentinel), `${text} / ${sentinel}`).toBe(false);
    }
  });
});

describe('leaksIn', () => {
  it('names the surface and the sentinel of each leak', () => {
    const found = leaksIn([
      { where: 'request 3', text: `GET /x?p=${SENTINELS.password}` },
      { where: 'title', text: 'Merge PDF' },
      { where: 'localStorage', text: `{"n":"${SENTINELS.watermark}"}` },
    ]);
    expect(found).toEqual(['request 3 holds the password sentinel', 'localStorage holds the watermark sentinel']);
  });

  it('lets the name of the file through only where the caller says it may be', () => {
    const surfaces = [{ where: 'download', text: `${SENTINELS.file}-merged.pdf` }];
    expect(leaksIn(surfaces)).toEqual(['download holds the file sentinel']);
    expect(leaksIn(surfaces, ['file'])).toEqual([]);
  });

  it('checks every sentinel on every surface, not only the one a tool takes', () => {
    const everything = Object.values(SENTINELS).join(' | ');
    expect(leaksIn([{ where: 'console', text: everything }])).toHaveLength(Object.keys(SENTINELS).length);
  });
});

describe('bytesHold', () => {
  const pdf = (body: Buffer): Uint8Array => new Uint8Array(Buffer.concat([Buffer.from('%PDF-1.7\n'), body, Buffer.from('\n%%EOF')]));

  it('finds the password as plain text, as a UTF-16 string and as a hex string', () => {
    const word = SENTINELS.password;
    expect(bytesHold(pdf(Buffer.from(`(${word})`)), word)).toBe('ASCII');
    expect(bytesHold(pdf(Buffer.from(word, 'utf16le')), word)).toBe('UTF-16 little endian');
    expect(bytesHold(pdf(Buffer.from(word, 'utf16le').swap16()), word)).toBe('UTF-16 big endian');
    expect(bytesHold(pdf(Buffer.from(`<${Buffer.from(word).toString('hex')}>`)), word)).toBe('hex (lower case)');
    expect(bytesHold(pdf(Buffer.from(`<${Buffer.from(word).toString('hex').toUpperCase()}>`)), word)).toBe('hex (upper case)');
  });

  it('says nothing about bytes that do not hold it', () => {
    expect(bytesHold(pdf(Buffer.from('(Orca-Sentinel-7391) 1234 stream')), SENTINELS.password)).toBeNull();
    expect(bytesHold(new Uint8Array(0), SENTINELS.password)).toBeNull();
  });
});

describe('brokenRequests', () => {
  const origin = 'http://127.0.0.1:4173';

  it('lets the GET of the own origin without a body or a query string through, and the blobs that stay in the browser', () => {
    expect(brokenRequests([request(), request({ url: `${origin}/_astro/worker-abc.js` }), request({ url: 'blob:http://127.0.0.1:4173/uuid' }), request({ url: 'data:text/plain;base64,AAAA' })], origin)).toEqual([]);
  });

  it('stops another origin, a method that writes, a body and a query string', () => {
    expect(brokenRequests([request({ url: 'https://www.google-analytics.com/g/collect' })], origin)).toEqual(['to another origin: GET https://www.google-analytics.com/g/collect']);
    expect(brokenRequests([request({ method: 'POST' })], origin)).toEqual(['POST /merge-pdf/']);
    expect(brokenRequests([request({ bodyBytes: 4, body: 'abcd' })], origin)).toEqual(['GET /merge-pdf/ with a body of 4 bytes']);
    expect(brokenRequests([request({ url: `${origin}/merge-pdf/?q=1` })], origin)).toEqual(['GET /merge-pdf/ with a query string']);
  });

  it('shows the whole request to the search: method, address, headers and body', () => {
    const text = requestText(request({ method: 'POST', url: `${origin}/x`, headers: { 'x-note': SENTINELS.signature }, body: SENTINELS.marker }));
    expect(holds(text, SENTINELS.signature)).toBe(true);
    expect(holds(text, SENTINELS.marker)).toBe(true);
    expect(text.startsWith(`POST ${origin}/x`)).toBe(true);
  });
});
