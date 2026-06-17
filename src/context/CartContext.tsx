import { createContext, useContext, useReducer, useMemo, useCallback, type ReactNode } from 'react';
import type { CartState, CartAction, CartItem } from '@/types';
import { products } from '@/data/products';

const FREE_SHIPPING_THRESHOLD = 599;
const FREE_COLD_CHAIN_THRESHOLD = 1199;
const GIFT_WRAP_PRICE = 35;
const COLD_CHAIN_BASE_RATE = 99;
const COLD_CHAIN_PER_ICE_PACK = 15;

const initialState: CartState = {
  items: [],
  isDrawerOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
              : i
          ),
          isDrawerOpen: true,
        };
      }
      return {
        ...state,
        items: [...state.items, {
          productId: action.payload.productId,
          quantity: action.payload.quantity || 1,
          giftWrap: { enabled: false, message: '', ribbonColor: 'gold' },
        }],
        isDrawerOpen: true,
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.productId !== action.payload.productId),
      };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.productId !== action.payload.productId),
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.payload.productId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case 'UPDATE_GIFT_WRAP':
      return {
        ...state,
        items: state.items.map(i =>
          i.productId === action.payload.productId
            ? { ...i, giftWrap: action.payload.giftWrap }
            : i
        ),
      };
    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: !state.isDrawerOpen };
    case 'OPEN_DRAWER':
      return { ...state, isDrawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, isDrawerOpen: false };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  subtotal: number;
  totalQuantity: number;
  giftWrapTotal: number;
  shippingCost: number;
  total: number;
  isColdChainRequired: boolean;
  icePackCount: number;
  freeShippingProgress: number;
  freeShippingMessage: string;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateGiftWrap: (productId: string, giftWrap: CartItem['giftWrap']) => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearCart: () => void;
  getCartProduct: (productId: string) => typeof products[0] | undefined;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const subtotal = useMemo(() => {
    return state.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [state.items]);

  const totalQuantity = useMemo(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  const giftWrapTotal = useMemo(() => {
    return state.items.reduce((sum, item) => {
      return sum + (item.giftWrap.enabled ? GIFT_WRAP_PRICE : 0);
    }, 0);
  }, [state.items]);

  const isColdChainRequired = useMemo(() => {
    return state.items.some(item => {
      const product = products.find(p => p.id === item.productId);
      return product?.coldChainRequired;
    });
  }, [state.items]);

  const maxTransitHours = useMemo(() => {
    let max = 120;
    state.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product?.coldChainRequired && product.maxTransitHours < max) {
        max = product.maxTransitHours;
      }
    });
    return max;
  }, [state.items]);

  const icePackCount = useMemo(() => {
    if (!isColdChainRequired) return 0;
    return Math.ceil(maxTransitHours / 24);
  }, [isColdChainRequired, maxTransitHours]);

  const shippingCost = useMemo(() => {
    if (isColdChainRequired) {
      if (subtotal >= FREE_COLD_CHAIN_THRESHOLD) return 0;
      return COLD_CHAIN_BASE_RATE + icePackCount * COLD_CHAIN_PER_ICE_PACK;
    }
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return subtotal > 0 ? 29 : 0;
  }, [isColdChainRequired, subtotal, icePackCount]);

  const total = subtotal + giftWrapTotal + shippingCost;

  const freeShippingProgress = useMemo(() => {
    if (isColdChainRequired) {
      return Math.min(subtotal / FREE_COLD_CHAIN_THRESHOLD, 1);
    }
    return Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
  }, [subtotal, isColdChainRequired]);

  const freeShippingMessage = useMemo(() => {
    if (isColdChainRequired) {
      if (subtotal >= FREE_COLD_CHAIN_THRESHOLD) return 'Free cold-chain shipping unlocked!';
      const remaining = FREE_COLD_CHAIN_THRESHOLD - subtotal;
      return `Add Rs ${remaining} for free cold-chain shipping`;
    }
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 'Free shipping unlocked!';
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
    return `Add Rs ${remaining} for free shipping`;
  }, [subtotal, isColdChainRequired]);

  const addItem = useCallback((productId: string, quantity?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { productId, quantity } });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const updateGiftWrap = useCallback((productId: string, giftWrap: CartItem['giftWrap']) => {
    dispatch({ type: 'UPDATE_GIFT_WRAP', payload: { productId, giftWrap } });
  }, []);

  const toggleDrawer = useCallback(() => dispatch({ type: 'TOGGLE_DRAWER' }), []);
  const openDrawer = useCallback(() => dispatch({ type: 'OPEN_DRAWER' }), []);
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);

  const getCartProduct = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, []);

  return (
    <CartContext.Provider value={{
      state, dispatch, subtotal, totalQuantity, giftWrapTotal,
      shippingCost, total, isColdChainRequired, icePackCount,
      freeShippingProgress, freeShippingMessage,
      addItem, removeItem, updateQuantity, updateGiftWrap,
      toggleDrawer, openDrawer, closeDrawer, clearCart, getCartProduct,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
