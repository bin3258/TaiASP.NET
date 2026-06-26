import React, { createContext, useContext, useState, useCallback } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    const refreshCart = useCallback(async (customerId) => {
        if (!customerId) {
            setCartCount(0);
            return;
        }
        try {
            const data = await cartService.getCart(customerId);
            setCartCount(Array.isArray(data) ? data.length : 0);
        } catch {
            setCartCount(0);
        }
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
