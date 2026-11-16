import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Sign a PDF Without Printing It, and What Kind of Signature It Is',
  description: 'Sign a PDF by drawing, uploading or typing your signature: what that signature is, how it differs from one with a certificate, and what it changed in our PDFs.',
  h1: 'How to sign a PDF without printing it',
  lead: 'Draw, upload or type your signature, and it goes on the page as a picture. What that picture is, what it is not, and what it changed in our files.',
  changed: 'First version of this guide, published on {published}.',
  intro: [
    'You do not need a printer to sign a PDF. On paper, you print the pages, sign them with a pen and scan them back, and what you send is a picture of each sheet. Signing the PDF itself keeps its pages as they are and adds your signature on top of the ones you choose.',
    'That signature is an image. A PDF can also carry another kind, a digital signature with a certificate, which this tool does not make.',
  ],
  toolHeading: 'Sign your PDF here',
  toolIntro: 'Drop a PDF, make your signature with the option you like, place it on the preview and press Sign PDF. You get a signed copy to download.',
  sections: [
    {
      heading: 'Two kinds of signature',
      paragraphs: [
        'What Sign PDF puts on the page is an image: the lines you drew, the picture you chose, or your name drawn in the font of the site. It sits on the page the way a stamp sits on paper. Anyone who opens the PDF sees it, and nothing in the file ties it to you or to the moment you signed.',
        'A digital signature is something else. NIST, the standards agency of the United States, says in its Digital Signature Standard that digital signatures are used to detect unauthorized modifications to data and to authenticate the identity of the signatory. One is made from the bytes of the file with a private key that only the signer holds, and a certificate identifies the matching public key and its owner.',
        'Sign PDF holds no key and no certificate, so it cannot make that kind of signature. For one, you need a signing service that works with certificates.',
      ],
    },
    {
      heading: 'What the signature changed in our files',
      paragraphs: [
        'We signed {files_word} test PDFs on every page, once in each of the {modes_word} ways, in Chromium and in WebKit, and read each signed copy back. Every signed page gained an image, and its text stayed as it was: the text a reader extracts from each page was the same in all {textKeptChromium_word} copies signed in Chromium and all {textKeptWebkit_word} signed in WebKit. It can still be searched, selected and copied.',
        'Our IRS Form 1040 is a fillable form with {formFields} fields, and every one of them was still in each signed copy. Its XFA layer, a second copy of the form that a few desktop apps read, did not survive: Sign PDF removed it and said so next to the file in all {formXfaNoteChromium_word} copies signed in Chromium.',
        'We also looked for a signature dictionary and a byte range, the parts of a PDF that hold a digital signature and the span of bytes it seals. In the copies signed in Chromium, we counted {newSigDictsChromium} new signature dictionaries and {newByteRangesChromium} new byte ranges.',
      ],
    },
    {
      heading: 'Draw, upload or type: what each way added',
      paragraphs: [
        'Draw: sign in the box with a finger, a pen or the mouse. On our files a drawn signature added from {drawAddedMinChromium} to {drawAddedMaxChromium} in Chromium. The same strokes, drawn by the same script in WebKit, added more, from {drawAddedMinWebkit} to {drawAddedMaxWebkit}.',
        'Upload: choose a PNG or a JPG of your signature. A PNG with a clear background puts only the ink on the page, where a JPG brings its whole rectangle along. Our test image is not a real signature but a picture of {signatureImageWidth} by {signatureImageHeight} pixels, {signatureImageBytes} as a PNG, and the tool saves it again before it goes on the page. The PDF of {mixedPages_word} pages grew by {mixedUploadAddedChromium_exact} and the form of {formPages_word} by {formUploadAddedChromium_exact}, nearly the same: the image went into each file once, however many pages show it. Still, it took our PDF of mixed pages from {mixedBefore} to {mixedUploadChromium}, so crop a photo or scan of your signature to the ink before you upload it.',
        'Type: write your name, and the tool draws it as an image in the font of the site. On each of our PDFs it added the least of any way, from {typeAddedMinChromium} to {typeAddedMaxChromium}.',
        'Then drag the box to its spot and pick the pages: this page, all pages or the ones you choose. When two people have to sign, the first one signs and downloads, and the second opens that signed copy here and adds a signature.',
      ],
    },
    {
      heading: 'Signing a file that is already signed',
      paragraphs: [
        'The tax form in our sample already carried a seal of the digital kind: a usage-rights signature, with a byte range that covered the whole file. After Sign PDF, that seal was still inside all {formUsageRightsAfterChromium_word} copies signed in Chromium, but its byte range no longer covered the file. A digital signature is made to notice changes, and adding a picture to the page is a change.',
        'So before you sign here a PDF that already carries a digital signature, ask whoever sent it how they want it signed.',
      ],
    },
    {
      heading: 'Whether a signed PDF is accepted',
      paragraphs: [
        'In the United States, a federal law, the Electronic Signatures in Global and National Commerce Act (E-SIGN), says that in a transaction in or affecting interstate or foreign commerce, a signature or a contract may not be denied legal effect, validity or enforceability solely because it is in electronic form. It defines an electronic signature as an electronic sound, symbol or process, attached to or logically associated with a record and adopted by a person with the intent to sign it.',
        'The same law sets limits. It does not require anyone to agree to use or accept electronic signatures, and it does not apply to some records at all, such as wills, adoption and divorce papers, and court orders and filings.',
        'So whether your signed PDF is accepted depends on who receives it, on the kind of document and on the law of the place, which outside the United States is another law. This guide is not legal advice, and no file can promise that a signature is valid. When it matters, ask the person or office that wants your signature which kind they accept: a picture on the page, or a digital signature with a certificate.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'A drawn signature added to each PDF', value: '{drawAddedMinChromium} to {drawAddedMaxChromium}' },
      { label: 'Digital signature parts added', value: '{newSigDictsChromium}', sub: 'in {signedChromium} signed copies of {files} PDFs' },
    ],
    sample: '{files} test PDFs, each signed on every page in the {modes_word} ways of Sign PDF.',
    link: 'See the table',
  },
  tableHeading: 'PDF by PDF',
  measuredIntro: 'Each of our {files_word} test PDFs, signed on every page in Chromium, once in each way; with the PNG we uploaded, the sample is {testFiles_word} files. Before signing, the PDF with pages of mixed sizes weighed {mixedBefore}, the PDF made of photos {photosBefore} and the form {formBefore}.',
  measuredNote: 'Measured on {date} through the Sign PDF page of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, with the signature drawn by a script with the mouse and the name typed as Oli Orca. The signed copies were read back in Node with PDF.js and pdf-lib. The table shows the copies signed in Chromium.',
  tables: [
    {
      heading: 'Each PDF signed in each way',
      caption: 'Each test PDF signed on every page in Chromium, way by way: the size of the signed file and what the signature added to it',
      head: ['PDF', 'Signature', 'Signed file', 'Added'],
      labels: ['Drawn', 'Uploaded image', 'Typed name'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'esign-7001', label: 'govinfo: 15 U.S.C. 7001, General rule of validity', href: 'https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap96-subchapI-sec7001.htm', read: '2026-11-16' },
    { id: 'esign-7003', label: 'govinfo: 15 U.S.C. 7003, Specific exceptions', href: 'https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap96-subchapI-sec7003.htm', read: '2026-11-16' },
    { id: 'esign-7006', label: 'govinfo: 15 U.S.C. 7006, Definitions', href: 'https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap96-subchapI-sec7006.htm', read: '2026-11-16' },
    { id: 'nist-fips-186-5', label: 'NIST: FIPS 186-5, Digital Signature Standard (DSS)', href: 'https://csrc.nist.gov/pubs/fips/186-5/final', read: '2026-11-16' },
    { id: 'nist-certificate', label: 'NIST CSRC Glossary: public key certificate', href: 'https://csrc.nist.gov/glossary/term/public_key_certificate', read: '2026-11-16' },
  ],
  facts: {},
  names: ['15 U.S.C. 7001', '15 U.S.C. 7003', '15 U.S.C. 7006', 'FIPS 186-5', 'Form 1040'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
