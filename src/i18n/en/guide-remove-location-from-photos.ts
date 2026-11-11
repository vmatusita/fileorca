import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'How to Remove Location Data From Photos Before You Share Them',
  description: 'Where a photo keeps the place it was taken, how to stop or hide it on iPhone and Android, and the way to strip it from the file without changing a pixel.',
  h1: 'How to remove location data from photos before you share them',
  lead: 'A phone photo can carry the exact place it was taken. Here is how to keep it out of the photos you share.',
  changed: 'First version of this guide, published on {published}. The numbers were measured again on {measured}, and the tool in the guide went from Resize image to Remove EXIF data.',
  intro: [
    'Phones write facts about each photo into the file itself: the camera, the date and time, and, when location is on, the GPS coordinates of where you stood. Apple puts it plainly: the coordinates are embedded into each photo and video. Anyone who gets the original file can read them, and a few clicks put them on a map.',
    'Some apps strip this data when you post, and some do not. Email, file transfers, cloud folders and many chat apps send the file as it is. If a photo shows your home, your child’s school or anywhere you would rather not pin, remove the location before the file leaves your hands.',
  ],
  toolHeading: 'Strip the metadata',
  toolIntro: 'This is Remove EXIF data, with nothing to set: each photo keeps every pixel and comes back without its location, camera and date. It runs in this browser tab, so the photos are never uploaded.',
  sections: [
    {
      heading: 'What our photos carried',
      paragraphs: [
        'All {withGps_word} of our real phone photos in JPG had GPS coordinates, {withCamera_word} named the camera model and {withDate_word} had the date and time they were taken. They are old test photos from a Google Pixel and from iPhones, and the data was all still there.',
        'Of our {heicFiles} HEIC test photos, {heicWithGps} had real GPS coordinates and all {heicWithCamera} named the camera. HEIC is the format an iPhone uses by default, and it carries the same kind of data as a JPG.',
      ],
    },
    {
      heading: 'Stop the camera from saving it',
      paragraphs: [
        'The surest way is to never record it. On an iPhone, Apple’s steps are: go to Settings, then Privacy & Security, then Location Services, then Camera, and tap Never. Apple notes that location data can be collected only if the Camera app has access to Location Services.',
        'On Android it depends on the phone. Google’s help says you can control whether your camera adds location to your photos, and that the setting varies by manufacturer. In the Pixel Camera app, Google’s steps are to open the camera settings and turn off Save location.',
      ],
    },
    {
      heading: 'Share without it from your phone',
      paragraphs: [
        'On an iPhone you can leave the location out each time you share. Apple’s steps: select the photos, tap the share button, tap Options, and turn off Location. The share sheet then shows Location Not Included above the Options button. For a photo already in your library, tap Adjust Info, then Adjust Location, then No Location.',
        'Google Photos keeps locations private by default, according to its help center. It can remove a location it estimated, but if the camera added the location, Google says you cannot update or remove it in Google Photos. For those files, strip the data from the file itself.',
      ],
    },
    {
      heading: 'Strip it from the file without changing the photo',
      paragraphs: [
        'Every image tool on this site leaves the metadata out of the files it gives back. Most of them also change the picture: they compress it, crop it, turn it or change its format. So we measured which one changes the photo least, by a rule fixed before the measurement: the same frame, the same format, and the pixels closest to the original.',
        'Remove EXIF data won. It does not decode or encode the photo again: it copies the picture data as it is and leaves the metadata out. Our photos came back with identical pixels, {removeExifDataIdenticalChromium_word} of them, and only {removeExifDataRatioChromium_off} lighter, the weight of the metadata. Resize image, set to keep the full size, gave back the very same files, so the rule picked the tool with nothing to set.',
      ],
    },
    {
      heading: 'What the other tools did',
      paragraphs: [
        'Compress image also removed the location and made the photos {compressImageRatioChromium_off} lighter, but by recompressing them: its lowest score on our photos was {compressImagePsnrMinChromium} of PSNR, a measure of how close two images are, where higher is closer. Good for sending, not for keeping. Crop image and Rotate image change the frame by design, and PNG to JPG turned the photos into PNG files {pngToJpgRatioChromium_times} the size in Chromium and {pngToJpgRatioWebkit_times} in WebKit.',
        'None of them left GPS coordinates, camera names or dates in the photos, and the PDF from Image to PDF carried no GPS either. The table under "What we measured" has each tool.',
      ],
    },
    {
      heading: 'What stays, and what a photo still shows',
      paragraphs: [
        'Two things stay on purpose. A photo stored upside down keeps a tiny tag that says which way is up, so it does not show turned: {removeExifDataOrientationChromium_word} of our photos kept one. The color profile stays too, so the colors do not shift.',
        'Removing the data does not hide what is in the picture. Google’s help warns that people may still work out where a photo was taken from what it shows, such as a landmark. Look at the photo itself before you share it.',
      ],
    },
    {
      heading: 'For HEIC photos',
      paragraphs: [
        'Remove EXIF data takes JPG, PNG and WebP. For HEIC photos from an iPhone, use HEIC to JPG instead: it writes each JPG from the pixels, and none of our HEIC test photos kept any GPS data after the conversion. Our HEIC to JPG guide has those measurements.',
      ],
    },
  ],
  half: 3,
  measuredHeading: 'What we measured',
  sheet: {
    stats: [
      { label: 'Photos with GPS left', value: '{removeExifDataGpsChromium} of {photos}' },
      { label: 'Photos with the same pixels', value: '{removeExifDataIdenticalChromium} of {photos}', sub: '{removeExifDataRatioChromium_off} lighter' },
    ],
    sample: '{photos} phone photos, through the Remove EXIF data above.',
    link: 'See the table',
  },
  tableHeading: 'Tool by tool',
  measuredIntro: 'Our {photos_word} real phone photos through each image tool that takes a JPG, each set to change the photo as little as it can. The share is the size after against the originals, and pixels compares each copy with the original on the worst of the photos.',
  measuredNote: 'Measured on {date} through the tool pages of this site in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}. The two browsers wrote files of the same size with {browsersSameSize_word} of the {candidates_word} tools; with {browsersDiffer}, the sizes differed. The metadata and the pixels were read in Node, with the same decoder for the original and the copy. The table shows Chromium.',
  tables: [
    {
      heading: 'Each tool on our photos',
      caption: 'Each image tool that takes a JPG: the size after, the format, whether the frame stays the same, and how close the pixels are on the worst photo',
      head: ['Tool', 'Size after', 'Format', 'Same frame', 'Pixels, worst photo', 'Photos with GPS left'],
      constant: 'No tool left GPS data in any photo.',
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'apple-location', label: 'Apple Support: Manage location metadata in Photos', href: 'https://support.apple.com/guide/personal-safety/manage-location-metadata-in-photos-ips0d7a5df82/web', read: '2026-11-01' },
    { id: 'google-photos-location', label: 'Google Photos Help: Understand, find and edit your photos’ locations', href: 'https://support.google.com/photos/answer/6153599?hl=en&co=GENIE.Platform%3DAndroid', read: '2026-11-01' },
    { id: 'google-photos-privacy', label: 'Google Photos Help: How Google Photos protects your location data', href: 'https://support.google.com/photos/answer/11190100?hl=en', read: '2026-11-01' },
    { id: 'google-camera-location', label: 'Google Photos Help: Change your camera location settings', href: 'https://support.google.com/photos/answer/9921876?hl=en', read: '2026-11-01' },
    { id: 'pixel-camera', label: 'Pixel Camera Help: Change your Camera app settings', href: 'https://support.google.com/pixelcamera/answer/2838995?hl=en', read: '2026-11-01' },
  ],
  facts: {},
  names: [],
  relatedHeading: 'Related tools and guides',
};

export default texts;
