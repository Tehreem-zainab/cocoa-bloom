export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: 'bar' | 'truffle' | 'bonbon' | 'gift-set';
  flavorMap: {
    intensity: number;
    sweetness: number;
    bitterness: number;
    fruitiness: number;
    nuttiness: number;
  };
  tastingNotes: string[];
  ingredients: string;
  allergens: string[];
  pairings: string[];
  coldChainRequired: boolean;
  maxTransitHours: number;
  giftWrappable: boolean;
  isTruffle: boolean;
  seasonal: boolean;
  inStock: boolean;
  stockLevel: 'high' | 'low' | 'out';
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  giftWrap: {
    enabled: boolean;
    message: string;
    ribbonColor: 'gold' | 'crimson' | 'sage';
  };
}

export interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { productId: string; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'UPDATE_GIFT_WRAP'; payload: { productId: string; giftWrap: CartItem['giftWrap'] } }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'OPEN_DRAWER' }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'CLEAR_CART' };

export type ShippingMethod = 'standard' | 'expedited' | 'cold-chain';

export type Locale = 'zh' | 'en';
