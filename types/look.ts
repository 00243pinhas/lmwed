export type Look = {
  slug: string;
  name: string;
  collection: 'Lumière' | 'Harmattan';
  fabric: string[];
  silhouette: 'A-Line' | 'Ball Gown' | 'Mermaid' | 'Slip' | 'Column';
  sleeves: boolean;
  description: string;
  detailDescription: string;
  productionWeeks: string;
  startingPrice: number;
  images: {
    hero: string;
    gallery: string[];
    card: string;
  };
  featured: boolean;
};
