import type { LicensesTexts } from '../types.ts';

export default {
  title: 'Licenses of the open-source software and fonts',
  description:
    'The open-source software and fonts that reach your browser when you use FileOrca, with their licenses. Tools used only to build the site are not listed.',
  h1: 'Licenses',
  intro:
    'FileOrca stands on open-source software. This page lists the software and fonts that reach your browser, with their licenses. Tools used only to build the site are not listed, because they are not distributed.',
  packagesHeading: 'Software',
  fontsHeading: 'Fonts',
  noFonts: 'The site does not load any web font yet.',
  packageColumn: 'Package',
  versionColumn: 'Version',
  licenseColumn: 'License',
  showText: 'Show license text',
  sourceLabel: 'Source',
  bundledHeading: 'Software inside other software',
  bundledIntro:
    'These packages are not installed on their own. Each one comes inside a package above and ends up in the files your browser gets.',
  viaLabel: 'Comes with',
  showTextOf: 'Show the license of',
  copiedFrom: 'Copied from',
  lgplHeading: 'HEIC photos and the LGPL',
  lgplWhat:
    'HEIC photos are opened with libheif, a free library under the GNU Lesser General Public License, version 3 (LGPL-3.0). It reaches your browser through the libheif-js package, which also holds libde265, the video decoder HEIC photos need, under the same license.',
  lgplSeparate:
    "FileOrca uses libheif without any change. The compiled library is the file libheif.wasm, and the site serves it as a file of its own, byte for byte as the package ships it. The JavaScript that starts it is the package's own, handled only by the tool that builds the site.",
  lgplReplace:
    "You can run a different version of the library. The page asks for libheif.wasm by its web address, so a build you made from the source code below can take its place, for example with the local overrides in your browser's developer tools.",
  lgplSourceHeading: 'Source code of the version in use',
  lgplRoles: {
    libheif: 'the library',
    libde265: 'the HEVC decoder inside it',
    wrapper: 'the npm package that wraps it',
    build: 'the scripts that build the .wasm file',
  },
  lgplTexts:
    'The full text of the LGPL-3.0, and the GPL-3.0 it refers to, are under libheif-js in the first table below.',
} satisfies LicensesTexts;
