import type { FileGuideTexts } from '../types.ts';

const texts: FileGuideTexts = {
  title: 'Social Media Image Sizes, From Each Network’s Own Help Pages',
  description: 'The image sizes Instagram, Facebook, X, LinkedIn, YouTube and Pinterest publish, and what real photos look like and weigh when resized to them.',
  h1: 'Social media image sizes',
  lead: 'Each network publishes the sizes it wants, and resizes whatever does not fit. Here are the sizes from their own help pages, and what a photo becomes at each one.',
  changed: 'First version, with the measurements and the help pages of {date}.',
  intro: [
    'Every social network takes a photo, fits it to its own frame and compresses it again. If the photo is far bigger than the frame, the network throws pixels away with its own settings. If it has the wrong shape, the network crops it where it chooses. Uploading a photo that already has the right size and shape keeps those decisions in your hands.',
    'The sizes below come only from each network’s own help or developer pages, read on the date at the bottom of this page. Where a network publishes a figure only for ads, the table says so. TikTok is not in the table: its help pages we read give no size for photos.',
  ],
  toolHeading: 'Resize your photos here',
  toolIntro: 'Choose By size, type the width and the height of the size you need, and drop your photos. Each one fits inside that box, keeps its proportions and stays in this browser tab.',
  sections: [
    {
      heading: 'What the networks ask for',
      paragraphs: [
        'Instagram is precise about shape. Its help center says photos keep their size when they are between {igMinWidth} and {igMaxWidth} wide, are made smaller above that, and keep their full frame when the shape is between {igRatios}. A taller or wider photo gets cropped. LinkedIn recommends a width of {liPostWidth} for photos in posts, Facebook gives exact sizes for a Page’s profile picture and cover, and X gives them for the profile photo and the header.',
        'The table under "What we measured" lists each size with the network and the use, and the largest file our photos made at that size. The limits in the last column are the heaviest file each page allows, where it gives one.',
      ],
    },
    {
      heading: 'Fit inside, or fill the frame',
      paragraphs: [
        'Resize image keeps the proportions of the photo. A photo goes inside the box you type, as large as it can, and never gets stretched. Our portrait photo has the same shape as the tallest Instagram frame, so it came out at exactly {instagramPortraitWidth} × {instagramPortraitHeight}. A landscape photo in the same box came out at {instagramLandscapeWidth} × {instagramLandscapeHeight}, because it is wider than it is tall.',
        'That is why only {exactFrames_word} of our {outputs} resized photos came out at the exact size the network names. For a Facebook cover, a landscape photo came out at {facebookCoverLandscapeWidth} × {facebookCoverLandscapeHeight}: it fits, but it does not fill the wide frame, and the network fills or crops the rest.',
        'To fill a frame exactly, crop first, then resize. Crop image has a square, a portrait and a wide frame ready, and a free box for any other shape. Resize the cropped photo to the size in the table, and the network has nothing left to change.',
      ],
    },
    {
      heading: 'The YouTube thumbnail in one step',
      paragraphs: [
        'YouTube asks for thumbnails in {ytRatio}, at least {ytMinWidth} wide, and its help page recommends {ytRecommended} for videos. Uploaded from the phone app, a thumbnail can weigh up to {ytPhoneLimit}.',
        'The YouTube thumbnail preset does the crop and the resize at once: it cuts the photo to {ytRatio} around its center and makes it exactly the size in the table, small enough for the phone app. All {thumbnailExactChromium_word} of our photos came out at that exact size, and the largest weighed {thumbnailMaxChromium}.',
      ],
    },
    {
      heading: 'File size is rarely the problem',
      paragraphs: [
        'Resizing to a social media size makes a photo much lighter, because most of its pixels go. Of our resized photos, {underLimit} were for a size with a published limit, and all {underLimit} were under it. The largest file we made weighed {largestOutput}.',
        'The tightest figure is the Facebook cover: Facebook says it loads fastest when it is under {fbCoverLimit}. Our largest cover weighed {facebookCoverMaxChromium}. If a cover is still too heavy, compress it after resizing.',
      ],
    },
    {
      heading: 'Before you upload',
      paragraphs: [
        'Profile pictures can be shown in a circle. Facebook, for one, says a Page’s profile picture shows at {fbProfileDesktop} on computers and {fbProfilePhone} on smartphones, cropped to a circle, so keep the face in the middle of the square and away from the corners.',
        'Start from the original photo every time and resize it once. A photo resized twice, or taken from a screenshot of another post, has already lost detail the network cannot bring back.',
        'Use JPG for photos and PNG for logos, text and flat colors, which stay sharp in PNG. And check what the photo says about you: the resized copy is written from its pixels, so it leaves the location and the camera details of the original behind.',
      ],
    },
  ],
  half: 2,
  measuredHeading: 'What we measured',
  measuredIntro: 'Each size published on the networks’ own pages, the sizes our phone photos came out at with Resize image, and the largest file at each size. The YouTube thumbnail row comes from the YouTube thumbnail preset.',
  measuredNote: 'Measured on {date} in Chromium {chromiumVersion} and in WebKit {webkitVersion} on {system}, through the Resize image page of this site (By size) and its YouTube thumbnail preset, on our real phone photos, in portrait and in landscape. The table shows Chromium; WebKit wrote slightly larger files at the same sizes.',
  tables: [
    {
      heading: 'Sizes and what our photos became',
      caption: 'Each network size: the network, the use, the official size, the sizes our photos came out at, the largest file and the published limit',
      head: ['Network', 'Use', 'Official size', 'Our photos came out', 'Largest file', 'Limit'],
    },
  ],
  sourcesHeading: 'Sources',
  sources: [
    { id: 'instagram-feed', label: 'Instagram Help Center: Image resolution of photos you share on Instagram', href: 'https://help.instagram.com/1631821640426723/?locale=en_US', read: '2026-11-01' },
    { id: 'instagram-reel-cover', label: 'Instagram Help Center: Reel size and aspect ratios on Instagram', href: 'https://help.instagram.com/1038071743007909/?locale=en_US', read: '2026-11-01' },
    { id: 'facebook-page', label: 'Facebook Help Center: Facebook Page profile picture and cover photo dimensions', href: 'https://www.facebook.com/help/125379114252045?locale=en_US', read: '2026-11-01' },
    { id: 'facebook-link', label: 'Meta for Developers: Images in Link Shares', href: 'https://developers.facebook.com/documentation/sharing/webmasters/images', read: '2026-11-01' },
    { id: 'x-profile', label: 'X Help Center: Help with uploading a profile photo', href: 'https://help.x.com/en/managing-your-account/common-issues-when-uploading-profile-photo', read: '2026-11-01' },
    { id: 'linkedin-post', label: 'LinkedIn Help: Share photos on LinkedIn', href: 'https://www.linkedin.com/help/lms/answer/a527229?lang=en', read: '2026-11-01' },
    { id: 'linkedin-profile-cover', label: 'LinkedIn Help: Add or change the cover image on your profile', href: 'https://www.linkedin.com/help/linkedin/answer/a568217/add-or-change-the-background-photo-on-your-profile?lang=en', read: '2026-11-01' },
    { id: 'linkedin-page-cover', label: 'LinkedIn Help: Image specifications for your LinkedIn Pages and Career Pages', href: 'https://www.linkedin.com/help/linkedin/answer/a563309/image-specifications-for-your-linkedin-pages-and-career-pages?lang=en', read: '2026-11-01' },
    { id: 'youtube-banner', label: 'YouTube Help: Manage your channel branding', href: 'https://support.google.com/youtube/answer/10456525?hl=en', read: '2026-11-01' },
    { id: 'youtube-thumbnail', label: 'YouTube Help: Add custom thumbnails on YouTube', href: 'https://support.google.com/youtube/answer/72431?hl=en', read: '2026-11-01' },
    { id: 'pinterest-pin', label: 'Pinterest Business help: Review ad specs', href: 'https://help.pinterest.com/en/business/article/pinterest-product-specs', read: '2026-11-01' },
  ],
  facts: {
    igMinWidth: { text: '320', source: 'instagram-feed' },
    igMaxWidth: { text: '1080 pixels', source: 'instagram-feed' },
    igRatios: { text: '1.91:1 and 3:4', source: 'instagram-feed' },
    liPostWidth: { text: '1080 pixels', source: 'linkedin-post' },
    ytRatio: { text: '16:9', source: 'youtube-thumbnail' },
    ytMinWidth: { text: '640 pixels', source: 'youtube-thumbnail' },
    ytRecommended: { text: '3840 × 2160', source: 'youtube-thumbnail' },
    ytPhoneLimit: { text: '2 MB', source: 'youtube-thumbnail' },
    fbCoverLimit: { text: '100 KB', source: 'facebook-page' },
    fbProfileDesktop: { text: '176 × 176', source: 'facebook-page' },
    fbProfilePhone: { text: '196 × 196', source: 'facebook-page' },
  },
  names: [],
  relatedHeading: 'Related tools and guides',
};

export default texts;
