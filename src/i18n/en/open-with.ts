import type { OpenWithTexts } from '../types.ts';

// The page of the share target (F8, decision 1; DECISOES § 290): the installed app opens it with the shared files.
export default {
  title: 'Open with',
  description:
    'Choose a FileOrca tool for the images and PDFs you shared from your phone. The files wait on your device.',
  h1: 'Open with FileOrca',
  lead: 'Choose a tool for the files you shared. They stay on this device.',
  filesHeading: 'Your files',
  takesThis: 'Takes this file',
  takesAll: 'Takes all {total} files',
  takesSome: 'Takes {count} of {total} files',
  noTool: 'No tool here opens these files. FileOrca works with JPG, PNG, WebP, HEIC and PDF.',
  emptySays: 'Nothing to open here yet.',
  emptyDetail: 'Share images or PDFs with FileOrca from your phone, or pick a tool.',
  unknown: 'unknown format',
  unnamed: 'File with no name',
} satisfies OpenWithTexts;
