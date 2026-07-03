export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  city: string;
  country: string;
  year: string;
  dress: string;
  collection: 'Lumière' | 'Harmattan';
  image?: string;
  heroImage?: string;
  featured: boolean;
};
