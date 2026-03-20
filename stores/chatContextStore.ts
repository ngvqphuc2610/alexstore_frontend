import { create } from 'zustand';

interface ProductReference {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface OrderReference {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
}

interface ChatContextState {
  // The product or order being referenced when opening chat
  selectedReference: {
    type: 'product' | 'order';
    data: ProductReference | OrderReference;
  } | null;

  // The seller to chat with
  targetSellerId: string | null;

  // Actions
  setProductReference: (product: ProductReference, sellerId: string) => void;
  setOrderReference: (order: OrderReference, sellerId: string) => void;
  clearReference: () => void;
  clearAll: () => void;
}

export const useChatContextStore = create<ChatContextState>((set) => ({
  selectedReference: null,
  targetSellerId: null,

  setProductReference: (product, sellerId) =>
    set({
      selectedReference: { type: 'product', data: product },
      targetSellerId: sellerId,
    }),

  setOrderReference: (order, sellerId) =>
    set({
      selectedReference: { type: 'order', data: order },
      targetSellerId: sellerId,
    }),

  clearReference: () => set({ selectedReference: null }),

  clearAll: () => set({ selectedReference: null, targetSellerId: null }),
}));
