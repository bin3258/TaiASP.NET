import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartTable from './CartTable';
import { useAuth } from '../../contexts/AuthContext';
import cartService from '../../services/cartService';

const CartPage = () => {
    const { user, initialized } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = useCallback(async () => {
        if (!user?.customerId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await cartService.getCart(user.customerId);
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải giỏ hàng:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!initialized) return;
        if (!user) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [user, navigate, initialized, fetchCart]);

    const handleUpdateQuantity = async (cartId, quantity) => {
        try {
            await cartService.updateQuantity(cartId, quantity);
            setItems(prev =>
                prev.map(item =>
                    item.cartId === cartId
                        ? { ...item, quantity, total: quantity * item.price }
                        : item
                )
            );
        } catch (error) {
            console.error("Lỗi cập nhật số lượng:", error);
        }
    };

    const handleRemove = async (cartId) => {
        try {
            await cartService.removeItem(cartId);
            setItems(prev => prev.filter(item => item.cartId !== cartId));
        } catch (error) {
            console.error("Lỗi xóa sản phẩm:", error);
        }
    };

    const handleClear = async () => {
        try {
            await cartService.clearCart(user.customerId);
            setItems([]);
        } catch (error) {
            console.error("Lỗi xóa giỏ hàng:", error);
        }
    };

    return (
        <>
            <Header />
            <main className="cart-page">
                <div className="container">
                    <h1 className="cart-page__title">Giỏ hàng</h1>
                    <CartTable
                        items={items}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemove}
                        onClear={handleClear}
                        loading={loading}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CartPage;
