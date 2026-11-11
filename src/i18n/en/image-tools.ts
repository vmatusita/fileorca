import type { ImageToolsTexts } from '../types.ts';

export default {
  // F18 (decision 13): eleven with Remove EXIF data; the presets are not counted.
  title: 'Image tools: eleven free tools, no upload',
  description:
    'Compress, resize, crop, rotate, convert and clean images, or turn them into a PDF. Eleven free image tools that run in your browser, with no upload.',
  eyebrow: 'Image tools',
  h1: 'Eleven image tools, zero uploads',
  intro: 'Eleven tools to compress, resize, crop, rotate, convert, clean and combine images, all in your browser, and nothing is uploaded.',
  toolsHeading: 'All image tools',
  // F18: Flip image is neither a size nor a limit, so the heading says what every preset is.
  presetsHeading: 'Ready-made settings',
  presetsCaption: 'Ready-made settings for common sizes, file limits and mirrored photos',
  presetsHead: ['Preset', 'What you get'],
  guideHeading: 'Which tool do you need?',
  guideIntro:
    'Every tool works the same way. You drop one image or a whole batch, Oli processes each file on your device, and you download the results one by one or together in a ZIP. Nothing is uploaded, so the size of a batch depends only on your device.',
  guide: [
    { before: 'A form or an email turns down a big photo:', tool: 'compress-image', after: 'makes the file lighter, and the presets above aim at 100 KB or 1 MB.' },
    { before: 'A site asks for exact dimensions:', tool: 'resize-image', after: 'sets the width and the height in pixels or by percentage.' },
    { before: 'Only part of the picture matters:', tool: 'crop-image', after: 'keeps that part, as a square, 4:5, 16:9 or a free shape.' },
    { before: 'A photo came out sideways:', tool: 'rotate-image', after: 'turns it 90° or 180°, or mirrors it.' },
    { before: 'An iPhone photo does not open on your computer:', tool: 'heic-to-jpg', after: 'turns the HEIC file into a JPG or a PNG.' },
    { before: 'A WebP image has to be a JPG or a PNG:', tool: 'webp-to-jpg', after: 'converts it.' },
    { before: 'A PNG has to be a JPG, or a JPG a PNG:', tool: 'png-to-jpg', after: 'converts it either way.' },
    { before: 'An image saved from a website came as AVIF:', tool: 'avif-to-jpg', after: 'turns it into a JPG.' },
    { before: 'A web page needs lighter images:', tool: 'convert-to-webp', after: 'turns JPG and PNG into smaller WebP or AVIF files.' },
    { before: 'Several pictures have to go as one document:', tool: 'image-to-pdf', after: 'puts them in one PDF, one image per page.' },
    { before: 'A photo should go out without its location or camera details:', tool: 'remove-exif-data', after: 'takes the metadata out and leaves every pixel as it was.' },
  ],
  guideOutro:
    'Each tool also leaves the photo metadata out of the copy you download, so the GPS location of a phone photo stays with you.',
} satisfies ImageToolsTexts;
