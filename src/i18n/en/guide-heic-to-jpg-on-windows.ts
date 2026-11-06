import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Convert HEIC to JPG on Windows, Photo by Photo or All at Once',
  description: 'Why Windows will not open your iPhone photos, the settings that avoid HEIC, and what changes in size and location when the photos become JPGs.',
  h1: 'How to convert HEIC to JPG on Windows',
  lead: 'Your iPhone saved the photo as HEIC, and Windows will not open it, or a website will not take it. Here is why, and how to end up with a JPG.',
  changed: 'First version of this guide, published on {published} with these measurements.',
  intro: [
    'HEIC is the file Apple writes when an iPhone or iPad saves photos in its High Efficiency format, which is built on HEIF. The picture is the same as in a JPG, but it is packed more tightly, so the phone keeps more photos in the same space. The catch is everywhere else: Windows needs extra software to show it, and many upload forms still ask for a JPG.',
    'You can fix this in different places. You can teach Windows to read HEIC, you can tell the iPhone to stop writing it, or you can convert the files you already have. Each one solves a different part of the problem, and the last one is the only one that gives you JPG files to send anywhere.',
  ],
  toolHeading: 'Convert your HEIC photos here',
  toolIntro: 'Drop one HEIC photo or a whole batch. Each one becomes a JPG inside this browser tab, so the photos are never uploaded, and a batch comes back as one ZIP.',
  sections: [
    {
      heading: 'Why Windows asks for an extension',
      paragraphs: [
        'Windows does not read HEIC on its own. When you open one in the Photos app, Microsoft says you may see the message "You need an extension to use this file." The fix Microsoft gives is a pair of extensions from the Microsoft Store: HEIF Image Extensions, which is {heifPrice}, and HEVC Video Extensions, which costs {hevcPrice}. Microsoft says you need both, even if you only plan to look at photos, and that the Photos app has to be restarted after they are installed.',
        'That is a good fix if all you want is to look at the photos on your own PC. It does not change the files, though. They are still HEIC, so the website, the shared folder or the person you send them to may still be unable to open them.',
      ],
    },
    {
      heading: 'Stop the iPhone from writing HEIC',
      paragraphs: [
        'If most of your photos end up on Windows, you can switch the camera to JPG for everything you take from now on. Apple describes the setting: open Settings, tap Camera, tap Formats, then tap Most Compatible. From then on the camera saves photos as JPEG and videos as H.264. Choosing High Efficiency goes back to HEIF and HEVC, which take less space on the phone.',
        'Apple also recommends Most Compatible when you transfer photos to a Windows PC, together with its Apple Devices app from the Microsoft Store. This only changes the photos you take after the switch. The ones already on the phone stay HEIC.',
      ],
    },
    {
      heading: 'Let the transfer convert them',
      paragraphs: [
        'When photos travel from an iPhone to a computer over a cable, Apple says the media may be converted to JPEG or H.264 on the way. The phone does this unless it is told to keep the originals: open Settings, tap Apps, tap Photos, then scroll down and tap Keep Originals. If you leave that setting off, the copies that reach the PC can already be JPGs.',
        'Microsoft points to a similar route without a cable: many devices convert HEIC photos to a more common format when the files are transferred or emailed, and OneDrive can convert photo files on its own. Both depend on how the photos travel, so they are worth knowing but hard to count on for a folder of files you already have.',
      ],
    },
    {
      heading: 'Convert the files you already have',
      paragraphs: [
        'For photos that are already HEIC on your PC or in a download folder, a converter is the direct way. The tool on this page reads each HEIC file with libheif, the same open decoder for every browser, turns the main picture upright and writes a new JPG from its pixels. You can drop one file or a whole folder of them, and the ZIP keeps the original names with a .jpg ending.',
        'Nothing is sent anywhere. The conversion runs in your browser tab, which is also why it works for private photos: the network tab of your browser shows no request carrying the file.',
      ],
    },
    {
      heading: 'What converting did to our photos',
      paragraphs: [
        'We ran the converter on our {files} HEIC test photos, taken with {cameras} different camera models, from iPhones to a Samsung phone and an Apple Vision Pro. Together the HEIC files weighed {heicTotal}. The JPGs weighed {jpgTotalChromium}, which is {ratioTotalChromium_more} more.',
        'That is the price of compatibility. Photo by photo the change went from {ratioMinChromium_change} to {ratioMaxChromium_change}, and half of them grew by {ratioMedianChromium_more} or less. A JPG packs the same picture less tightly than HEIC, which is why our photos came out bigger together, not smaller. If you need it smaller, compress or resize the JPG afterwards.',
        'All {sameSizeChromium_word} JPGs kept the size in pixels of the photo as the phone shows it, turned the right way up.',
      ],
    },
    {
      heading: 'The location does not come along',
      paragraphs: [
        'A photo can carry where it was taken. Of our {files} photos, {gpsBefore} had real GPS coordinates, and {gpsTagBefore} had a GPS tag of some kind, filled or empty. After the conversion, the number of JPGs with any GPS data in them was {gpsAfterChromium}.',
        'This is on purpose: the tool writes each JPG from the pixels, so the location, the camera details and the other metadata of the HEIC stay behind. If you want the location kept, for a photo map or an album, keep the HEIC original, or use the export of your photo app instead.',
      ],
    },
    {
      heading: 'What else stays in the HEIC',
      paragraphs: [
        'Converting re-encodes the picture, so the JPG is a new file, not a copy of the HEIC with a new name. Some HEIC files also hold more than one picture. Only the main picture becomes the JPG: the depth map of a portrait shot and the second picture of a spatial photo are left out.',
        'Your HEIC files are never changed. Keep them as the originals and send the JPGs, and you lose nothing.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'Size as JPG, all together', value: '{ratioTotalChromium_change}', from: '{heicTotal}', to: '{jpgTotalChromium}' },
      { label: 'JPGs that kept the GPS location', value: '{gpsAfterChromium} of {files}' },
    ],
    sample: '{files} HEIC test photos from {cameras} cameras.',
    link: 'See each one in the table',
  },
  tableHeading: 'Photo by photo',
  measuredIntro: 'Every HEIC test photo of this site, converted with the defaults of the tool above. Change is the JPG against the HEIC.',
  measuredNote: 'Measured on {date} in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, through the HEIC to JPG page of this site, on our {files} HEIC test photos. The table shows Chromium; WebKit gave the same bytes for all {files} photos.',
  tables: [
    {
      heading: 'Our HEIC photos as JPG',
      caption: 'Each HEIC test photo: its camera, its size as HEIC and as JPG, the change, its size in pixels, and its GPS before the conversion',
      head: ['Camera', 'HEIC', 'JPG', 'Change', 'Pixels', 'GPS before', 'GPS after'],
      constant: 'No JPG kept any GPS data.',
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'ms-photos', label: 'Microsoft Support: Photos app Video Editor error, can’t view this file type', href: 'https://support.microsoft.com/en-us/windows/apps/photos/photos-app-video-editor-error-can-t-view-this-file-type', read: '2026-11-01' },
    { id: 'ms-heif', label: 'Microsoft Store: HEIF Image Extension', href: 'https://apps.microsoft.com/detail/9pmmsr1cgpwg?hl=en-US&gl=US', read: '2026-11-01' },
    { id: 'apple-heif', label: 'Apple Support: Using HEIF or HEVC media on Apple devices', href: 'https://support.apple.com/en-us/116944', read: '2026-11-01' },
    { id: 'apple-transfer', label: 'Apple Support: Transfer photos from your iPhone or iPad', href: 'https://support.apple.com/en-us/120267', read: '2026-11-01' },
  ],
  facts: {
    heifPrice: { text: 'free', source: 'ms-photos' },
    hevcPrice: { text: '$0.99', source: 'ms-photos' },
  },
  names: ['H.264'],
  relatedHeading: 'Related tools and guides',
};

export default texts;
