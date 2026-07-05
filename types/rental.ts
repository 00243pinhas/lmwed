export type PaymentMethod = 'cash' | 'orange_money' | 'bank' | 'other';

export type AvailableDress = {
  id: string;
  name: string;
  size: string | null;
  rental_price: number;
};

export type ActiveRental = {
  id: string;
  client_name: string;
  client_phone: string;
  out_date: string;
  due_date: string;
  dress: { name: string; size: string | null } | null;
};
