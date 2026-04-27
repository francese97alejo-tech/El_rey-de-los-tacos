import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rdt_cart") || "[]");
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("rdt_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1, sauces = []) => {
    setItems((prev) => {
      // Tacos with sauces are always unique line items
      if (product.is_taco) {
        return [...prev, { lineId: crypto.randomUUID(), product, qty, sauces }];
      }
      const existing = prev.find((i) => i.product.id === product.id && !i.product.is_taco);
      if (existing) {
        return prev.map((i) =>
          i.lineId === existing.lineId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { lineId: crypto.randomUUID(), product, qty, sauces: [] }];
    });
  };

  const updateQty = (lineId, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i))
    );
  };

  const removeItem = (lineId) => setItems((prev) => prev.filter((i) => i.lineId !== lineId));

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [items]
  );

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  return (
    <CartCtx.Provider
      value={{ items, addItem, updateQty, removeItem, clear, total, count, open, setOpen }}
    >
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
