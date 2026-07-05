export type DressStatus = 'available' | 'rented' | 'retired';

export type Dress = {
  id: string;
  name: string;
  size: string | null;
  rental_price: number;
  status: DressStatus;
};
