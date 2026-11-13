// F19a (decision 8; DECISOES § 764 and § 765): one fact, one place. The rule of scripts/lib/repeticao.ts on small pages built
// here in the shape of the four molds: a clean page passes, then one change at a time (the mutants of the ficha), and the
// patterns of each mandatory fact on a sentence that says it and on one that only shares its words, in each language.
import { describe, expect, it } from 'vitest';
import {
  FACTS,
  MIN_SENTENCE_WORDS,
  NEAR_DUPLICATE,
  OWN_SUBJECT,
  checkRepetition,
  factsInLine,
  nearDuplicates,
  normalizeWords,
  pageKind,
  similarity,
  unitsOf,
} from '../../scripts/lib/repeticao.ts';
import { LANGS, ROUTES, languagesOf, type Lang } from '../../src/i18n/routes.ts';

interface Parts {
  head?: string;
  h1?: string;
  seal?: string;
  island?: string;
  how?: string[];
  specs?: [string, string][];
  presets?: string;
  faq?: [string, string][];
  privacy?: string;
  updated?: string;
  cards?: string;
  guideCard?: string;
}

/** A tool page in the shape of ImageToolPage (the breadcrumb, the top, the island, the blocks, the Updated line). */
function toolPage(parts: Parts = {}): string {
  const how = parts.how ?? ['Drop your images on the box, choose them, or paste them.', 'Pick a level.', 'Download the result.'];
  const specs = parts.specs ?? [
    ['Formats it takes', 'JPG, PNG and WebP. Oli checks what is inside the file, not its name.'],
    ['Batch', 'Several images download together as one ZIP.'],
  ];
  const faq = parts.faq ?? [
    ['Does compressing reduce quality?', 'At Recommended the difference is hard to see at normal size, and Strong trades detail for size.'],
    ['Why is my PNG barely smaller?', 'A PNG of a screenshot is often already well packed, so there is little left to take out.'],
  ];
  return `<!doctype html><html><head>${parts.head ?? '<title>Compress image | FileOrca</title><meta name="description" content="Compress JPG, PNG and WebP images.">'}</head><body>
<header><nav><a href="/">FileOrca</a></nav></header>
<main id="main">
  <nav aria-label="Breadcrumb"><ol class="fo-crumbs"><li><a href="/">Home</a></li><li><span aria-current="page">Compress image</span></li></ol></nav>
  <div class="fo-top fo-top--tool"><h1 class="fo-h1">${parts.h1 ?? 'Compress image'}</h1><div class="fo-top__seal"><span class="fo-seal"><svg></svg>${parts.seal ?? 'Your files never leave your device'}</span></div></div>
  <div id="fo-tool-root" data-props="{}"><div class="fo-tool-island">${parts.island ?? '<p>Drop images here</p>'}</div></div>
  <script>console.log('never sent to a server');</script>
  <section class="fo-section fo-prose" data-content="how" aria-labelledby="how"><h2 id="how">How it works</h2><ol class="fo-steps">${how.map((step) => `<li>${step}</li>`).join('')}</ol>${parts.guideCard ?? ''}</section>
  <section class="fo-section fo-prose" data-content="specs" aria-labelledby="specs"><h2 id="specs">What goes in and what comes out</h2><table class="fo-table"><caption class="fo-sr">What it takes</caption><thead><tr><th scope="col">Detail</th><th scope="col">What happens</th></tr></thead><tbody>${specs.map(([detail, what]) => `<tr><th scope="row">${detail}</th><td>${what}</td></tr>`).join('')}</tbody></table>${parts.presets ?? ''}</section>
  <section class="fo-section" data-content="faq" aria-labelledby="faq"><h2 id="faq">Questions</h2><div class="fo-faq">${faq.map(([q, a]) => `<details><summary>${q}<svg></svg></summary><div><p>${a}</p></div></details>`).join('')}</div></section>
  <section class="fo-section fo-prose" data-content="privacy" aria-labelledby="privacy-note"><h2 id="privacy-note">Privacy</h2><p>${parts.privacy ?? 'Images are processed on your device and are never sent to a server.'} <a class="fo-howtocheck" href="/how-it-works/">How to check</a></p></section>
  <p class="fo-updated" data-updated>${parts.updated ?? 'Updated <time datetime="2026-11-13">November 13, 2026</time> · <a href="/whats-new/">What\'s new</a>'}</p>
  <section class="fo-section" data-content="related" aria-labelledby="related"><h2 id="related">More image tools</h2><ul class="fo-grid">${parts.cards ?? '<li><a class="fo-tool" href="/resize-image/"><h3 class="fo-tool__name">Resize image</h3><p class="fo-tool__desc">Change the size of an image.</p></a></li>'}</ul></section>
</main>
<footer><p>Your files never leave your device. Nothing is uploaded.</p></footer>
</body></html>`;
}

/** A calculator page in the shape of CalcTool: the lead, the signature, the island, how, an own block, works, presets, faq. */
function calcPage(extra: { faq?: [string, string][]; works?: string; privacy?: string } = {}): string {
  const faq = extra.faq ?? [['Where does the rate come from?', 'You type it. The starting value is an example, not a quote from a lender.']];
  return `<!doctype html><html><head><title>Mortgage calculator | FileOrca</title></head><body><main>
  <nav aria-label="Breadcrumb"><ol class="fo-crumbs"><li><a href="/">Home</a></li></ol></nav>
  <div class="fo-top fo-top--calc fo-top--calcpage"><h1 class="fo-h1">Mortgage calculator</h1><p class="fo-lead">What your monthly payment will be, with taxes and fees.</p><p class="fo-reviewed fo-reviewed--line" data-ymyl="reviewed">Reviewed by Victor Yuki Matusita · <time datetime="2026-10-31">Oct 31, 2026</time></p><span class="fo-seal">Your numbers stay on your device</span></div>
  <div id="fo-tool-root" class="fo-calc-island"><p>Your numbers stay on your device</p></div>
  <section class="fo-section fo-prose" data-content="how" aria-labelledby="how"><h2 id="how">How to use it</h2><ol class="fo-steps"><li>Enter the price.</li><li>Type the rate.</li><li>Read the payment.</li></ol><div class="fo-guidehere"><a class="fo-guidecard" href="/guides/x/"><span>Guide</span> <span>Rounded to the cent, as the lender does.</span></a></div></section>
  <section class="fo-section fo-prose" data-content="own" aria-labelledby="own-0"><h2 id="own-0">Biweekly programs</h2><p>Some programs charge a fee to set up the payments.</p></section>
  <section class="fo-section fo-prose" data-content="works" aria-labelledby="works"><h2 id="works">How it is worked out</h2><div data-ymyl="formula"><p>${extra.works ?? 'Each month the interest is the balance times r, rounded to the cent.'}</p></div><div data-ymyl="source"><ul><li><a href="https://example.org/">CFPB</a>. Read on <time datetime="2026-10-31">October 31, 2026</time>.</li></ul><p class="fo-reviewed">First published <time datetime="2026-10-31">October 31, 2026</time></p></div></section>
  <section class="fo-section fo-prose" aria-labelledby="presets"><h2 id="presets">More mortgage calculators</h2><table class="fo-table"><tbody><tr><th scope="row"><a href="/x/">Extra payments</a></th><td>What extra payments save.</td></tr></tbody></table></section>
  <section class="fo-section" data-content="faq" aria-labelledby="faq"><h2 id="faq">Questions</h2><div class="fo-faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join('')}</div></section>
  <section class="fo-section fo-prose" data-content="privacy" aria-labelledby="privacy-note"><h2 id="privacy-note">Privacy</h2><p>${extra.privacy ?? 'Your numbers stay on your device. The calculator runs in your browser.'} <a href="/how-it-works/">How to check</a></p></section>
  <section class="fo-section" data-content="related" aria-labelledby="related"><h2 id="related">Related calculators</h2><ul class="fo-grid"><li><a class="fo-tool" href="/y/"><h3>Loan</h3><p>Your numbers stay on your device.</p></a></li></ul></section>
</main></body></html>`;
}

const PRIVACY_ANSWER: [string, string] = ['Is my image uploaded?', 'No. Open the Network tab while you compress: no request carries your files.'];

describe('repetição: as unidades da página', () => {
  it('reads the blocks of a tool page, each question of the FAQ on its own, and leaves out what never counts', () => {
    const units = unitsOf(toolPage({ presets: '<h3 class="fo-h3" id="presets">Compress to a size</h3><p>For any other limit, pick Up to a size.</p><table class="fo-table"><tbody><tr><th scope="row"><a href="/x/">To 100 KB</a></th><td>A JPG of 100 KB or less.</td></tr></tbody></table>' }));
    expect(units.map((unit) => unit.name)).toEqual(['how', 'specs', 'presets', 'faq 1', 'faq 2', 'faq', 'privacy', 'related']);
    const text = units.flatMap((unit) => unit.lines).join('\n');
    // The H1, the seal, the island, the breadcrumb, the script, the line "Updated", the cards and the footer are out.
    for (const never of ['Compress image', 'Your files never leave your device', 'Drop images here', 'Home', 'never sent to a server\');', 'Updated', 'November 13, 2026', 'Change the size of an image', 'Nothing is uploaded']) {
      expect(text, never).not.toContain(never);
    }
    // The presets part is a unit of its own, out of the specs; the "How to check" link is in the privacy note.
    expect(units.find((unit) => unit.name === 'specs')?.lines.join(' ')).not.toContain('For any other limit');
    expect(units.find((unit) => unit.name === 'presets')?.lines.join(' ')).toContain('For any other limit');
    expect(units.find((unit) => unit.name === 'privacy')?.lines.join(' ')).toContain('How to check');
    expect(units.find((unit) => unit.name === 'faq 2')?.question).toBe('Why is my PNG barely smaller?');
  });

  it('reads the units of a calculator: the lead, how, its own blocks, works, the presets, each question and the privacy note', () => {
    const units = unitsOf(calcPage({ faq: [['Q one?', 'Answer one is here.'], ['Q two?', 'Answer two is here.']] }));
    expect(units.map((unit) => unit.name)).toEqual(['intro', 'how', 'own 1', 'works', 'presets', 'faq 1', 'faq 2', 'faq', 'privacy', 'related']);
    const text = units.flatMap((unit) => unit.lines).join('\n');
    // The signature lines ("Reviewed by", "First published"), the GuideCard and the ToolCard are out.
    for (const never of ['Reviewed by', 'First published', 'Rounded to the cent, as the lender does', 'Loan']) expect(text, never).not.toContain(never);
    expect(units.find((unit) => unit.name === 'intro')?.lines).toEqual(['What your monthly payment will be, with taxes and fees.']);
  });

  it('keeps the headings, the question and the table labels out of the prose that is compared sentence by sentence', () => {
    const units = unitsOf(toolPage());
    const faq = units.find((unit) => unit.name === 'faq 1');
    expect(faq?.lines[0]).toBe('Does compressing reduce quality?');
    expect(faq?.prose.join(' ')).not.toContain('Does compressing reduce quality?');
    expect(units.find((unit) => unit.name === 'specs')?.prose.join(' ')).not.toMatch(/Formats it takes|What goes in|What it takes/);
  });

  it('reads text the molds may add out of every known block as the unit "other"', () => {
    const html = toolPage().replace('<p class="fo-updated"', '<p class="fo-note">Several images download together as one ZIP.</p><p class="fo-updated"');
    expect(unitsOf(html).map((unit) => unit.name)).toContain('other');
    expect(checkRepetition(html, 'en').join('\n')).toMatch(/batch-zip.*specs, other/);
  });

  it('gives every route of the rule a kind, and none to the hubs, the guides and the institutional pages', () => {
    const kinds = ROUTES.flatMap((route) => languagesOf(route).map(() => pageKind(route.id))).filter((kind) => kind !== null);
    // The 148 pages of the baseline (ferramentas, presets, calculadoras e QR code nos idiomas de cada uma), or more.
    expect(kinds.length).toBeGreaterThanOrEqual(148);
    for (const id of ['home', 'about', 'image-tools', 'pdf-tools', 'guides', 'how-it-works', 'whats-new']) expect(pageKind(id), id).toBeNull();
    expect(pageKind('compress-image')).toBe('image-tool');
    expect(pageKind('compress-image-to-100kb')).toBe('image-preset');
    expect(pageKind('merge-pdf')).toBe('pdf-tool');
    expect(pageKind('pdf-to-jpg-to-png')).toBe('pdf-preset');
    expect(pageKind('qr-code-generator')).toBe('qr');
    expect(pageKind('mortgage-calculator')).toBe('calc-money');
    expect(pageKind('mortgage-calculator-biweekly')).toBe('calc-preset');
    expect(pageKind('bmi-calculator')).toBe('calc-life');
  });
});

describe('repetição: a regra e os mutantes', () => {
  it('passes a page where each fact is in one block (the control)', () => {
    expect(checkRepetition(toolPage(), 'en')).toEqual([]);
    expect(checkRepetition(calcPage(), 'en')).toEqual([]);
  });

  it('fails a fact in two blocks: "nothing is sent" in the privacy note and in a question', () => {
    const problems = checkRepetition(toolPage({ faq: [PRIVACY_ANSWER] }), 'en');
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/not-sent\) aparece em 2 blocos: faq 1 \("Is my image uploaded\?"\), privacy/);
  });

  it('fails a fact in two answers of the FAQ', () => {
    const faq: [string, string][] = [
      ['Can I compress many images?', 'Yes. Several images download together as one ZIP.'],
      ['How do I get all of them?', 'Press Download all: you get a ZIP with every image.'],
    ];
    const specs: [string, string][] = [['Formats it takes', 'JPG, PNG and WebP.']];
    expect(checkRepetition(toolPage({ faq, specs }), 'en').join('\n')).toMatch(/batch-zip\) aparece em 2 blocos: faq 1 .*, faq 2/);
  });

  it('fails the metadata in the specs table and in the privacy note, and in the steps', () => {
    const specs: [string, string][] = [['Photo metadata', 'Camera model, date and GPS location are removed from every file.']];
    const privacy = 'Images are processed on your device and are never sent to a server. Each saved copy also leaves out the photo metadata.';
    expect(checkRepetition(toolPage({ specs, privacy }), 'en').join('\n')).toMatch(/metadata-gps\) aparece em 2 blocos: specs, privacy/);
    const how = ['Drop your photos.', 'Oli removes the GPS location.', 'Download them.'];
    expect(checkRepetition(toolPage({ specs, how }), 'en').join('\n')).toMatch(/metadata-gps\) aparece em 2 blocos: how, specs/);
  });

  it('passes the same fact in the title, the meta description, the H1, the seal and one block', () => {
    const head = '<title>Compress images: nothing is uploaded, never sent to a server | FileOrca</title><meta name="description" content="Never sent to a server: one ZIP for many images.">';
    expect(checkRepetition(toolPage({ head, h1: 'Compress image, never sent to a server', seal: 'Never sent to a server' }), 'en')).toEqual([]);
  });

  it('passes the same fact in the island and in one block', () => {
    const island = '<p>Your images are never sent to a server.</p><p>Several images download together as one ZIP.</p><p>Camera model, date and GPS location are removed.</p>';
    expect(checkRepetition(toolPage({ island }), 'en')).toEqual([]);
  });

  it('never counts the line "Updated", the ToolCards, the GuideCards nor the footer', () => {
    const updated = 'Updated <time datetime="2026-11-13">November 13, 2026</time>: nothing is ever sent to a server, and several files come in one ZIP.';
    const cards = '<li><a class="fo-tool" href="/x/"><h3>Image to PDF</h3><p>Images never sent to a server, in one ZIP.</p></a></li>';
    const guideCard = '<div class="fo-guidehere"><a class="fo-guidecard" href="/guides/x/"><span>Guide</span> <span>Your photos are never sent to a server; one ZIP for all.</span></a></div>';
    expect(checkRepetition(toolPage({ updated, cards, guideCard }), 'en')).toEqual([]);
  });

  it('passes a fact said twice inside the same block', () => {
    const specs: [string, string][] = [
      ['Batch', 'Several images download together as one ZIP.'],
      ['Download', 'One image downloads directly, and the ZIP holds the rest.'],
    ];
    expect(checkRepetition(toolPage({ specs }), 'en')).toEqual([]);
  });

  it('fails a sentence copied into two blocks, and a sentence copied with a few words changed', () => {
    const copy = 'Drag a row to a new place to change the order of the files in the list.';
    const how = ['Drop your PDFs on the box.', copy, 'Download the result.'];
    const exact = checkRepetition(toolPage({ how, faq: [['How do I change the order?', copy]] }), 'en');
    expect(exact.join('\n')).toMatch(/frase quase igual \(100%\) em how e faq 1 \("How do I change the order\?"\)/);
    const near = checkRepetition(toolPage({ how, faq: [['How do I change the order?', 'Drag a row to a new place to change the order of your files in the list.']] }), 'en');
    expect(near.join('\n')).toMatch(/frase quase igual \(\d+%\) em how e faq 1/);
  });

  it('never compares a short sentence, a heading or a question', () => {
    // Under MIN_SENTENCE_WORDS words: the same short line in two blocks is chance, not a copy.
    const how = ['Drop your PDFs.', 'Pick the pages you want.', 'Download it.'];
    expect(checkRepetition(toolPage({ how, faq: [['Which pages?', 'Pick the pages you want.']] }), 'en')).toEqual([]);
    // A question that repeats the words of a step asks; the answer says something else.
    const question = 'Should I deposit at the start or at the end of each month?';
    const steps = ['Pick whether you deposit at the start or at the end of each month.', 'Type the rate.', 'Read the result.'];
    expect(checkRepetition(toolPage({ how: steps, faq: [[question, 'Earlier deposits earn a little more interest over the years.']] }), 'en')).toEqual([]);
  });

  it('leaves out the fact that is the page subject (the metadata on Remove EXIF data), and only there', () => {
    expect(OWN_SUBJECT['remove-exif-data']).toEqual(['metadata-gps']);
    const specs: [string, string][] = [['What goes', 'The Exif data, with the GPS location and the date.']];
    const faq: [string, string][] = [['What is EXIF data?', 'EXIF is information a phone writes inside the photo, often with the GPS location.']];
    expect(checkRepetition(toolPage({ specs, faq }), 'en', 'remove-exif-data')).toEqual([]);
    expect(checkRepetition(toolPage({ specs, faq }), 'en', 'compress-image').join('\n')).toMatch(/metadata-gps/);
  });

  it('fails the numbers of a calculator in the privacy note and in a question, and a fact of the method in works and the FAQ', () => {
    const share: [string, string] = ['Can I share my numbers?', 'Copy link puts your numbers after the # of the address, so the same page opens with them.'];
    const privacy = 'Your numbers stay on your device, and the link you copy keeps the numbers after the #, a part of the address your browser never sends.';
    expect(checkRepetition(calcPage({ faq: [share], privacy }), 'en').join('\n')).toMatch(/calc-numbers\) aparece em 2 blocos: faq 1 .*, privacy/);
    const cent: [string, string] = ['Why is the last payment different?', 'The payment is rounded to the cent, and so is the interest.'];
    expect(checkRepetition(calcPage({ faq: [cent] }), 'en').join('\n')).toMatch(/rounded-to-cent\) aparece em 2 blocos: works, faq 1/);
  });

  it('says what each problem is in Portuguese, with the label of the fact and the question of the FAQ', () => {
    const [problem] = checkRepetition(toolPage({ faq: [PRIVACY_ANSWER] }), 'en');
    expect(problem).toBe('o fato "nada é enviado (o arquivo não sai do aparelho)" (not-sent) aparece em 2 blocos: faq 1 ("Is my image uploaded?"), privacy');
  });
});

describe('repetição: as frases quase iguais', () => {
  it('normalizes the words: lower case, no accents, no punctuation', () => {
    expect(normalizeWords('A transparência fica BRANCA, no JPG (sempre)!')).toEqual(['a', 'transparencia', 'fica', 'branca', 'no', 'jpg', 'sempre']);
  });

  it('scores the same words in the same order as 1, and unrelated sentences far below the threshold', () => {
    const a = normalizeWords('JPG and WebP are saved again after the cut, which is the only change.');
    expect(similarity(a, a)).toBe(1);
    const b = normalizeWords('Pick Recommended or Strong, or Up to a size with the maximum in KB.');
    const c = normalizeWords('Saved again as WebP, at the quality of Recommended or Strong; Up to a size turns it into a JPG.');
    expect(similarity(b, c)).toBeLessThan(NEAR_DUPLICATE);
    // Two sentences that only share the topic words (the baseline's highest pair that is not a repetition, 0.43).
    const d = normalizeWords('La tasa que paga una cuenta puede cambiar.');
    const e = normalizeWords('La tasa que paga tu cuenta de ahorros.');
    expect(similarity(d, e)).toBeLessThan(NEAR_DUPLICATE);
  });

  it('catches a short sentence copied inside a longer one (a real near duplicate of the baseline, 0.47)', () => {
    const a = normalizeWords('The shape of the picture is never distorted.');
    const b = normalizeWords('Oli crops it from the center to fill the frame, so the edges are cut and the shape of the picture is never distorted.');
    expect(a.length).toBeGreaterThanOrEqual(MIN_SENTENCE_WORDS);
    expect(similarity(a, b)).toBeGreaterThanOrEqual(NEAR_DUPLICATE);
  });

  it('pairs only sentences of different units', () => {
    const same = 'Each image gets the centered crop in the shape you picked.';
    const units = [
      { name: 'specs', lines: [same, same], prose: [same, same] },
      { name: 'faq 1', lines: ['Q?', 'Drop them all and each one gets the centered crop in the shape you picked.'], prose: ['Drop them all and each one gets the centered crop in the shape you picked.'] },
    ];
    const pairs = nearDuplicates(units);
    expect(pairs.every((pair) => pair.units[0] !== pair.units[1])).toBe(true);
    expect(pairs).toHaveLength(2);
  });
});

/** A sentence that says the fact, and one that only shares its words, per mandatory fact and language (decision 8). */
const CASES: { fact: string; lang: Lang; yes: string; no: string }[] = [
  { fact: 'not-sent', lang: 'en', yes: 'Images are processed on your device and are never sent to a server.', no: 'The server of the form may set its own limit on the size.' },
  { fact: 'not-sent', lang: 'pt', yes: 'As imagens são processadas no seu aparelho e nunca são enviadas a um servidor.', no: 'O servidor do formulário pode ter um limite próprio de tamanho.' },
  { fact: 'not-sent', lang: 'es', yes: 'Las imágenes se procesan en tu dispositivo y nunca se envían a un servidor.', no: 'El servidor del formulario puede tener su propio límite de tamaño.' },
  { fact: 'on-device', lang: 'en', yes: 'FileOrca compresses the images on your device, in your browser.', no: 'Which of the two saves faster depends on the browser.' },
  { fact: 'on-device', lang: 'en', yes: 'The code is made in your browser.', no: 'Download PDF and CSV save the inputs and the schedule on your device.' },
  { fact: 'on-device', lang: 'pt', yes: 'A compressão acontece no seu aparelho, dentro do navegador.', no: 'Qual dos dois salva mais rápido depende do navegador.' },
  { fact: 'on-device', lang: 'es', yes: 'Oli comprime las imágenes en tu dispositivo, en tu navegador.', no: 'Cuál de los dos guarda más rápido depende del navegador.' },
  { fact: 'metadata-gps', lang: 'en', yes: 'Camera model, date and GPS location are removed from every file.', no: 'The merged PDF keeps the title, author and other metadata of the first file.' },
  { fact: 'metadata-gps', lang: 'pt', yes: 'Modelo da câmera, data e localização GPS saem de todos os arquivos.', no: 'O PDF juntado fica com o título, o autor e os outros metadados do primeiro arquivo.' },
  { fact: 'metadata-gps', lang: 'es', yes: 'Se eliminan Exif, XMP, IPTC y GPS, y se aplica la orientación de la foto.', no: 'Cada parte toma el título, el autor y los demás metadatos de tu PDF.' },
  { fact: 'kb-1000-bytes', lang: 'en', yes: 'Each image comes out as a JPG of the size you type or less (1 KB = 1,000 bytes).', no: 'Small, Medium or Large, aiming at 512, 1,024 and 2,048 pixels wide.' },
  { fact: 'kb-1000-bytes', lang: 'pt', yes: 'Cada imagem sai como um JPG do tamanho que você digitar ou menos (1 KB = 1.000 bytes).', no: 'Perto de 512 pixels de largura no pequeno, 1.024 no médio e 2.048 no grande.' },
  { fact: 'kb-1000-bytes', lang: 'es', yes: 'Cada imagen sale como un JPG del tamaño que escribas o menos (1 KB = 1,000 bytes).', no: 'Unos 512 píxeles de ancho el pequeño, 1,024 el mediano y 2,048 el grande.' },
  { fact: 'already-small', lang: 'en', yes: 'If the new copy would not be smaller, you get the original back.', no: 'If you ask for more pixels than the image has, you get the original size back.' },
  { fact: 'already-small', lang: 'pt', yes: 'Se a cópia nova não ficar menor, você recebe o original de volta.', no: 'Se você pedir mais pixels do que a imagem tem, recebe o tamanho original de volta.' },
  { fact: 'already-small', lang: 'es', yes: 'Si la copia nueva no queda más pequeña, recibes el original de vuelta.', no: 'Si pides más píxeles de los que tiene la imagen, conserva su tamaño original.' },
  { fact: 'png-lossless', lang: 'en', yes: 'JPG and WebP are saved again after the cut. PNG is saved without loss.', no: 'JPG and WebP lose a little detail when they are saved again.' },
  { fact: 'png-lossless', lang: 'pt', yes: 'O PNG é salvo sem perda.', no: 'O JPG perde um pouco de detalhe quando é salvo de novo.' },
  { fact: 'png-lossless', lang: 'es', yes: 'El PNG se guarda sin pérdida.', no: 'El JPG pierde un poco de detalle cuando se guarda de nuevo.' },
  { fact: 'transparency-white', lang: 'en', yes: 'Transparent areas turn white, because JPG has no transparency.', no: 'Each page takes the size of its image, with no white border.' },
  { fact: 'transparency-white', lang: 'pt', yes: 'As áreas transparentes ficam brancas, porque o JPG não tem transparência.', no: 'Cada página fica do tamanho da imagem dela, sem borda branca.' },
  { fact: 'transparency-white', lang: 'es', yes: 'Las zonas transparentes quedan blancas, porque el JPG no tiene transparencia.', no: 'Cada página toma el tamaño de su imagen, sin borde blanco.' },
  { fact: 'batch-zip', lang: 'en', yes: 'Several images download together as one ZIP.', no: 'Several images are processed one after another.' },
  { fact: 'batch-zip', lang: 'pt', yes: 'Várias imagens são baixadas juntas num ZIP só.', no: 'Várias imagens são processadas uma depois da outra.' },
  { fact: 'batch-zip', lang: 'es', yes: 'Varias imágenes se descargan juntas en un ZIP.', no: 'Varias imágenes se procesan una tras otra.' },
  { fact: 'original-untouched', lang: 'en', yes: 'Download the merged PDF. Your original files stay untouched.', no: 'Keep your original and rotate once instead of in several steps.' },
  { fact: 'original-untouched', lang: 'pt', yes: 'Baixe o PDF novo, e o seu arquivo original continua intacto.', no: 'Guarde o original e gire uma vez só, em vez de girar em vários passos.' },
  { fact: 'original-untouched', lang: 'es', yes: 'Descarga el PDF nuevo; tu archivo original no se toca.', no: 'Conserva tu original y rota una sola vez en lugar de hacerlo en varios pasos.' },
  { fact: 'calc-numbers', lang: 'en', yes: 'Your numbers stay on your device.', no: 'Type the numbers from your Loan Estimate.' },
  { fact: 'calc-numbers', lang: 'en', yes: 'Copy link puts your numbers after the # of the address.', no: 'Copy link opens the same page with your numbers.' },
  { fact: 'calc-numbers', lang: 'pt', yes: 'Seus números ficam no seu aparelho.', no: 'Digite os números da proposta do banco.' },
  { fact: 'calc-numbers', lang: 'es', yes: 'Tus números se quedan en tu dispositivo.', no: 'Escribe los números de tu estimación del préstamo.' },
  { fact: 'free-no-account', lang: 'en', yes: 'The code is yours to use anywhere, for free, with no watermark.', no: 'Pick Free and drag any side or corner of the box.' },
  { fact: 'free-no-account', lang: 'pt', yes: 'O código é seu para usar onde quiser, de graça, sem marca d’água.', no: 'Escolha Livre e arraste qualquer lado da caixa.' },
  { fact: 'free-no-account', lang: 'es', yes: 'El código es tuyo para usarlo donde quieras, gratis, sin marca de agua.', no: '¿Un refinanciamiento sin costos de cierre es gratis?' },
];

describe('repetição: os padrões de cada fato obrigatório, nos três idiomas', () => {
  it('has the mandatory facts of the ficha, each with patterns in every language and a unique id', () => {
    const ids = FACTS.map((fact) => fact.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ['not-sent', 'on-device', 'metadata-gps', 'kb-1000-bytes', 'already-small', 'png-lossless', 'transparency-white', 'batch-zip', 'original-untouched', 'calc-numbers', 'free-no-account']) {
      expect(ids, id).toContain(id);
    }
    for (const fact of FACTS) for (const lang of LANGS) expect(fact.patterns[lang].length, `${fact.id} ${lang}`).toBeGreaterThan(0);
  });

  it('covers every mandatory fact in every language with a positive and a negative sentence', () => {
    for (const fact of new Set(CASES.map((each) => each.fact))) {
      for (const lang of LANGS) expect(CASES.some((each) => each.fact === fact && each.lang === lang), `${fact} ${lang}`).toBe(true);
    }
  });

  for (const { fact, lang, yes, no } of CASES) {
    it(`${fact} (${lang}): finds "${yes.slice(0, 40)}…" and not "${no.slice(0, 40)}…"`, () => {
      const only = FACTS.filter((each) => each.id === fact);
      expect(factsInLine(yes, lang, only)).toEqual([fact]);
      expect(factsInLine(no, lang, only)).toEqual([]);
    });
  }
});
