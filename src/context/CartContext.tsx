'use client'

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

// Define the shape of a cart item
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  image?: any;
  quantity: number;
  reference?: string; // Added reference
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

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        // If item exists, increment quantity
        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // Otherwise, add new item with quantity 1
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
