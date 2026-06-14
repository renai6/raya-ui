import type { CartItem, Product, SaleType } from "@/types";
import { create } from "zustand";

type SalesState = {
  cartItems: CartItem[];
  currentScannedItem: Product | null;
  selectedItem: CartItem | null;
  isEditQuantityDialogOpen: boolean;
  cashReceived: number;
  quantity: number;
  actions: {
    addProductToCart: (item: Product) => void;
    setCurrentScannedItem: (item: Product | null) => void;
    updatePriceType: (id: string, value: SaleType) => void;
    updateQuantity: (id: string, value: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    setSelectedItem: (item: CartItem | null) => void;
    setEditQuantityDialogOpen: (open: boolean) => void;
    setCashReceived: (amount: number) => void;
    setQuantity: (amount: number) => void;
  };
};

export const useSaleStore = create<SalesState>((set) => ({
  cartItems: [],
  currentScannedItem: null,
  selectedItem: null,
  isEditQuantityDialogOpen: false,
  quantity: 0,
  cashReceived: 0,
  transactionId: null,
  actions: {
    addProductToCart: (item: Product) => {
      set((state) => {
        const existingItemIndex = state.cartItems.findIndex(
          (cartItem) => cartItem.id === item.id,
        );

        if (existingItemIndex !== -1) {
          state.cartItems[existingItemIndex].quantity += state.quantity
            ? state.quantity
            : 1;

          return { cartItems: state.cartItems };
        }

        return {
          cartItems: [
            {
              id: item.id || "",
              productId: item.id || "",
              name: item.name,
              stock: item.stock,
              retailPrice: item.retailPrice,
              wholesalePrice: item.wholesalePrice,
              barcode: item.barcode,
              quantity: state.quantity || 1,
              selectedPrice: item.retailPrice,
              saleType: "RETAIL",
            },
            ...state.cartItems,
          ],
        };
      });
    },
    updatePriceType: (id: string, value: SaleType) => {
      set((state) => {
        const itemIndex = state.cartItems.findIndex(
          (cartItem) => cartItem.id === id,
        );

        const item = state.cartItems[itemIndex];
        item.saleType = value;
        item.selectedPrice =
          value === "WHOLESALE"
            ? (item.wholesalePrice ?? item.retailPrice)
            : item.retailPrice;

        return { cartItems: [...state.cartItems] };
      });
    },
    updateQuantity: (id: string, value: number) => {
      set((state) => {
        const itemIndex = state.cartItems.findIndex(
          (cartItem) => cartItem.id === id,
        );
        state.cartItems[itemIndex].quantity = value;

        return { cartItems: [...state.cartItems] };
      });
    },
    removeItem: (id: string) => {
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== id),
      }));
    },
    setCurrentScannedItem: (item: Product | null) => {
      set({ currentScannedItem: item });
    },
    setSelectedItem: (item: CartItem | null) => {
      set({ selectedItem: item });
    },
    clearCart: () => {
      set({ cartItems: [] });
    },
    setEditQuantityDialogOpen: (open: boolean) => {
      set({ isEditQuantityDialogOpen: open });
    },
    setCashReceived: (amount: number) => {
      set({ cashReceived: amount });
    },
    setQuantity: (number: number) => {
      set(() => {
        return { quantity: number };
      });
    },
  },
}));

export const useSalesActions = () => useSaleStore((state) => state.actions);
export const useSelectedItem = () =>
  useSaleStore((state) => state.selectedItem);
export const useSalesCartItems = () =>
  useSaleStore((state) => state.cartItems || []);
export const useSalesCurrentScannedItem = () =>
  useSaleStore((state) => state.currentScannedItem);
export const useIsEditQuantityDialogOpen = () =>
  useSaleStore((state) => state.isEditQuantityDialogOpen);
export const useSalesCashReceived = () =>
  useSaleStore((state) => state.cashReceived || 0);
export const useQuantity = () => useSaleStore((state) => state.quantity);
