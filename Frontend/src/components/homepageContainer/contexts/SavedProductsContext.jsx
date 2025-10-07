import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const SavedProductsContext = createContext(null);

export const SavedProductsProvider = ({ children }) => {
  const [savedProducts, setSavedProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("savedProducts")) || [];
      setSavedProducts(Array.isArray(stored) ? stored : []);
    } catch {
      setSavedProducts([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
  }, [savedProducts]);

  const isSaved = (productId) => savedProducts.some((p) => p?.id === productId);

  const add = (product) => {
    if (!product || product.id == null) return;
    setSavedProducts((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]));
  };

  const remove = (productId) => {
    setSavedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggle = (product) => {
    if (!product || product.id == null) return;
    setSavedProducts((prev) => (prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]));
  };

  const clear = () => setSavedProducts([]);

  const value = useMemo(
    () => ({ savedProducts, add, remove, toggle, isSaved, clear }),
    [savedProducts]
  );

  return <SavedProductsContext.Provider value={value}>{children}</SavedProductsContext.Provider>;
};

export const useSavedProducts = () => {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) throw new Error("useSavedProducts must be used within SavedProductsProvider");
  return ctx;
};


