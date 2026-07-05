export type OrderStage =
  | 'consultation'
  | 'design'
  | 'measurements'
  | 'production'
  | 'arrived'
  | 'delivered';

export type Order = {
  id: string;
  client_name: string;
  client_phone: string;
  description: string | null;
  agreed_price: number | null;
  stage: OrderStage;
  expected_delivery: string | null;
  share_token: string;
  created_at: string;
};

// What the bride's magic-link page (/my-dress/[token]) is allowed to see —
// deliberately narrower than Order. No client_phone, no agreed_price, no
// share_token itself: the page is purely about the dress, never money or
// other identifying/account data (skills/backend-storage.md).
export type BrideOrder = {
  id: string;
  client_name: string;
  description: string | null;
  stage: OrderStage;
  expected_delivery: string | null;
};

export type UnconvertedInquiry = {
  id: string;
  first_name: string;
  whatsapp: string;
  dress_description: string | null;
};

export type MediaType = 'image' | 'video';

export type OrderUpdate = {
  id: string;
  order_id: string;
  uploaded_by: string;
  media_url: string;
  media_type: MediaType;
  caption: string | null;
  stage: OrderStage | null;
  created_at: string;
};

export type OrderUpdateWithSignedUrl = OrderUpdate & { signedUrl: string | null };
