import { create } from "zustand";
import { PRODUCTS } from "../core/products";

export type CartItemType = {
  id: number;
  title: string;
  image: any;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItemType[];
  addItem: (item: CartItemType) => void;
  removeItem: (id: number) => void;
  incrementItem: (id: number) => void;
  decrementItem: (id: number) => void;
  getTotalPrice: () => string;
  getItemCount: () => number;
};

const initialCartItems: CartItemType[] = [];

export const useCartStore = create<CartState>((set, get) => ({
  items: initialCartItems,
  addItem: (item: CartItemType) => {
    const existingItem = get().items.find(
      (itemToFind) => itemToFind.id === item.id,
    );
    if (existingItem) {
      set((state) => ({
        items: state.items.map((itemToFind) =>
          itemToFind.id === item.id
            ? {
                ...itemToFind,
                quantity: Math.min(
                  itemToFind.quantity + item.quantity,
                  PRODUCTS.find((productToFind) => productToFind.id === item.id)
                    ?.maxQuantity || itemToFind.quantity,
                ),
              }
            : itemToFind,
        ),
      }));
    } else {
      set((state) => ({ items: [...state.items, item] }));
    }
  },
  removeItem: (id: number) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  incrementItem: (id: number) =>
    set((state) => {
      const product = PRODUCTS.find((productToFind) => productToFind.id === id);

      if (!product) return state;

      return {
        items: state.items.map((item) =>
          item.id === id && item.quantity < product.maxQuantity
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    }),
  decrementItem: (id: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    })),
  getTotalPrice: () => {
    const { items } = get();

    return items
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  },
  getItemCount: () => {
    const { items } = get();

    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));
