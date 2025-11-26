'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Define the shape of a cart item
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image?: any;
  quantity: number;
  reference?: string;
}

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const supabase = createClient();

  // 1. Listen to Auth Changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Helper to get the correct storage key
  const getStorageKey = useCallback(() => {
    return userId ? `cart_items_${userId}` : 'cart_items_guest';
  }, [userId]);

  // 2. Load Cart when User changes (or on init)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // CRITICAL FIX: If we are on the success page, Force Empty the cart immediately
      // This prevents the "ghost cart" issue where localStorage reloads the old cart
      if (window.location.pathname.includes('/success')) {
        console.log("Success page detected: Force clearing cart context.");
        setCartItems([]);
        setIsInitialized(true);
        return;
      }

      const key = getStorageKey();
      const storedCart = localStorage.getItem(key);
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error("Error parsing cart from local storage", e);
          setCartItems([]);
        }
      } else {
        setCartItems([]); // Start fresh if nothing stored for this user
      }
      setIsInitialized(true);
    }
  }, [getStorageKey]);

  // 3. Save Cart when items change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized, getStorageKey]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    console.log('Item added:', item.name);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== id));
  }, []);

  const updateItemQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item._id === id ? { ...item, quantity } : item))
      );
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = useMemo(() => 
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const itemCount = useMemo(() =>
    cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    cartTotal,
    itemCount,
  }), [cartItems, addToCart, removeFromCart, updateItemQuantity, clearCart, cartTotal, itemCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
