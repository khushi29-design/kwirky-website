"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine } from "./types";

const KEY = "kwirky-cart";

interface CartValue {
  lines: CartLine[];
  count: number;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    setLines((cur) => {
      const hit = cur.find((l) => l.slug === slug);
      return hit
        ? cur.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l))
        : [...cur, { slug, quantity }];
    });
  }, []);
  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((cur) =>
      quantity < 1
        ? cur.filter((l) => l.slug !== slug)
        : cur.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(99, quantity) } : l)),
    );
  }, []);
  const remove = useCallback((slug: string) => setLines((cur) => cur.filter((l) => l.slug !== slug)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo(
    () => ({ lines, count: lines.reduce((n, l) => n + l.quantity, 0), add, setQuantity, remove, clear }),
    [lines, add, setQuantity, remove, clear],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
