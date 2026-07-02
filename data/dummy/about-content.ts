import type { Value } from '@/types/value';
import type { Stat } from '@/types/stat';

export const storyPullQuote =
  "I didn't set out to build a bridal house. I set out to make sure no woman in Lubumbashi had to choose between the dress she dreamed of and the one she could actually have.";

export const storyParagraphs = [
  'Linda grew up watching her grandmother cut patterns on the kitchen table — fabric was never just fabric, it was a plan. Years later, she saw the same gap her grandmother worked around: brides in the DRC either paid a premium to import a gown, or settled for construction that couldn\'t hold up to a full day of dancing.',
  'So she built something in between. A design studio in Lubumbashi that understands the bride, paired with an atelier in Istanbul that understands couture construction — hand-finished seams, boning, and structure most local ateliers don\'t have the equipment for.',
  'Today, Linda still reviews every inquiry herself. No sales team, no call center — just a WhatsApp thread with the woman whose dress she\'s building, from the first sketch to the final stitch.',
];

export const productionModel = {
  headline: 'Two Cities. One Dress.',
  paragraphs: [
    'Every gown begins in Lubumbashi — a conversation, a sketch, and measurements taken in your own home, guided by Linda on a video call.',
    'That pattern travels to our Istanbul atelier, where a small team of couture-trained seamstresses hand-construct the gown: boning, interior corsetry, and finishing you won\'t find in ready-to-wear. Then it comes home to you.',
  ],
  image: 'https://placehold.co/1200x900/0c0a08/2a2420.png?text=Atelier+Placeholder&font=roboto',
  imageAlt: 'Placeholder — LM Weddyli atelier workspace, Istanbul',
};

export const values: Value[] = [
  {
    numeral: 'I',
    title: 'Integrity of Craft',
    description:
      "Every seam considered, every fabric tested before it's cut. We don't rush a gown to meet a deadline — the gown decides when it's ready.",
  },
  {
    numeral: 'II',
    title: 'Cultural Pride',
    description:
      'Rooted in Lubumbashi, designed for the women who call Central Africa home. Beauty that never asks you to leave who you are behind.',
  },
  {
    numeral: 'III',
    title: 'Lasting Beauty',
    description:
      'Built to be worn once and remembered for a lifetime — heirloom construction, not a gown that fades after the reception.',
  },
];

export const stats: Stat[] = [
  { value: '4+', label: 'Years' },
  { value: '120+', label: 'Gowns' },
  { value: '3', label: 'Countries' },
  { value: '2', label: 'Cities' },
];

export const founderTestimonial = {
  quote:
    "Linda doesn't just take your measurements. She listens to who you are, and somehow the dress becomes proof of it. Working with her felt less like a transaction and more like being understood.",
  name: 'Rachel M.',
  role: 'Bride, Lubumbashi',
};
