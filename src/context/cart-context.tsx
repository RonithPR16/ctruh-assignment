import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useEncryptedLocalStorage } from "../hooks/useEncryptedLocalStorage";
import type { CartItem, Product } from "../types";

const CART_KEY = "gulzeesh-cart-v1";

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  error: string | null;
  addItem: (product: Product) => void;
  removeItem: (id: CartItem["id"]) => void;
  incrementItem: (id: CartItem["id"]) => void;
  decrementItem: (id: CartItem["id"]) => void;
  clearError: () => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const buildCartItem = (product: Product, cartQty: number): CartItem => ({
  id: product.id,
  name: product.name,
  price: product.price,
  currency: product.currency ?? "USD",
  image: product.image,
  type: product.type,
  gender: product.gender,
  color: product.color,
  stock: product.quantity,
  cartQty,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useEncryptedLocalStorage<CartItem[]>(CART_KEY, []);
  const [error, setError] = useState<string | null>(null);
  const errorTimer = useRef<number | null>(null);

  const pushError = useCallback((message: string) => {
    setError(message);
    if (!toast.isActive(message)) {
      toast.error(message, { toastId: message });
    }
    if (errorTimer.current) {
      window.clearTimeout(errorTimer.current);
    }
    errorTimer.current = window.setTimeout(() => {
      setError(null);
    }, 2800);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (errorTimer.current) {
      window.clearTimeout(errorTimer.current);
    }
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.id === product.id);
        if (existing) {
          if (existing.cartQty + 1 > existing.stock) {
            pushError(`Only ${existing.stock} available for ${existing.name}.`);
            return prev;
          }
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, cartQty: item.cartQty + 1 }
              : item,
          );
        }
        if (product.quantity <= 0) {
          pushError(`Sorry, ${product.name} is out of stock.`);
          return prev;
        }
        return [...prev, buildCartItem(product, 1)];
      });
    },
    [pushError, setItems],
  );

  const removeItem = useCallback(
    (id: CartItem["id"]) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setItems],
  );

  const incrementItem = useCallback(
    (id: CartItem["id"]) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (item.cartQty + 1 > item.stock) {
            pushError(`Only ${item.stock} available for ${item.name}.`);
            return item;
          }
          return { ...item, cartQty: item.cartQty + 1 };
        }),
      );
    },
    [pushError, setItems],
  );

  const decrementItem = useCallback(
    (id: CartItem["id"]) => {
      setItems((prev) =>
        prev
          .map((item) => {
            if (item.id !== id) return item;
            return { ...item, cartQty: item.cartQty - 1 };
          })
          .filter((item) => item.cartQty > 0),
      );
    },
    [setItems],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.cartQty, 0),
    [items],
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.cartQty * item.price, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalAmount,
      error,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      clearError,
      clearCart,
    }),
    [
      items,
      totalItems,
      totalAmount,
      error,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      clearError,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
