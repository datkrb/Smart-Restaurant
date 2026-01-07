// Thêm sửa xóa giỏ hàng
import { create } from 'zustand';
import { CartItem, MenuItem, ModifierOption } from '../types';

interface CartState {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity: number, modifiers: { [groupId: string]: ModifierOption[] }) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (item, quantity, modifiers) => {
    // Tính giá từng món (Base + Modifiers)
    let modifierTotal = 0;
    Object.values(modifiers).forEach(options => {
      options.forEach(opt => modifierTotal += opt.priceDelta);
    });
    const finalPrice = (item.price + modifierTotal);

    const newItem: CartItem = {
      ...item,
      cartItemId: Math.random().toString(36).substring(2, 9),
      quantity,
      selectedModifiers: modifiers,
      totalPrice: finalPrice
    };

    set((state) => ({ items: [...state.items, newItem] }));
  },

  removeFromCart: (id) => set((state) => ({
    items: state.items.filter((i) => i.cartItemId !== id)
  })),

  updateQuantity: (id, delta) => set((state) => ({
    items: state.items
      .map((item) =>
        item.cartItemId === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
  })),

  clearCart: () => set({ items: [] }),

  totalAmount: () => {
    return get().items.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  }
}));