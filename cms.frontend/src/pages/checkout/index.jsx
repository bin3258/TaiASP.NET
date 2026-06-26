import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import orderService from '../../services/orderService';
import cartService from '../../services/cartService';

const API_BASE = 'https://localhost:7068';

const CheckoutPage = () => {
    const { user, initialized } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState({ fullName: '', phone: '', address: '', notes: '' });
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!initialized) return;

        if (!user?.customerId) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                const [info, cart] = await Promise.all([
                    orderService.getCheckoutInfo(user.customerId),
                    cartService.getCart(user.customerId)
                ]);
                setForm({
                    fullName: info.fullName || '',
                    phone: info.phone || '',
                    address: info.address || ''
                });
                setCartItems(Array.isArray(cart) ? cart : []);
            } catch (error) {
                console.error("Lỗi tải thông tin:", error);
                setError(error.response?.data?.message || 'Không thể tải thông tin thanh toán. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user, navigate, initialized]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.phone && !/^\d{10}$/.test(form.phone)) {
            setError('Số điện thoại phải có 10 chữ số');
            return;
        }

        try {
            setSubmitting(true);
            await orderService.updateCustomerInfo(user.customerId, {
                fullName: form.fullName,
                phone: form.phone,
                address: form.address
            });
            const result = await orderService.checkout(user.customerId, { notes: form.notes });
            setSuccess(`Đặt hàng thành công! Mã đơn: #${result.orderId}`);
            refreshCart(user.customerId);
            setCartItems([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const total = cartItems.reduce((sum, item) => sum + item.total, 0);

    if (loading) {
        return (
            <>
                <Header />
                <main className="checkout-page">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="checkout-page">
                <div className="container">
                    <h1 className="checkout-page__title">Thanh toán</h1>

                    {success ? (
                        <div className="checkout-success">
                            <i className="fa-solid fa-circle-check fa-4x mb-3" style={{ color: '#27ae60' }}></i>
                            <h2>{success}</h2>
                            <p className="text-muted">Cảm ơn bạn đã mua hàng!</p>
                            <button className="btn checkout-success__btn" onClick={() => navigate('/shop')}>
                                <i className="fa-solid fa-arrow-left mr-2"></i>Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="checkout-layout">
                            <div className="checkout-form">
                                <h2 className="checkout-section__title">Thông tin giao hàng</h2>

                                {error && <div className="checkout-error">{error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="checkout-field">
                                        <label>Họ tên người nhận</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="0123456789"
                                            required
                                        />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Địa chỉ giao hàng</label>
                                        <textarea
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                            rows="3"
                                            required
                                        />
                                    </div>
                                    <div className="checkout-field">
                                        <label>Ghi chú</label>
                                        <textarea
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                                            rows="3"
                                        />
                                    </div>

                                    <button type="submit" className="checkout-submit" disabled={submitting || cartItems.length === 0}>
                                        {submitting ? (
                                            <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                                        ) : (
                                            <i className="fa-solid fa-credit-card mr-2"></i>
                                        )}
                                        {submitting ? 'Đang xử lý...' : `Đặt hàng - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}`}
                                    </button>
                                </form>
                            </div>

                            <div className="checkout-summary">
                                <h2 className="checkout-section__title">Đơn hàng ({cartItems.length} sản phẩm)</h2>

                                {cartItems.length === 0 ? (
                                    <p className="text-muted">Giỏ hàng trống.</p>
                                ) : (
                                    <>
                                        <div className="checkout-items">
                                            {cartItems.map((item) => (
                                                <div className="checkout-item" key={item.cartId}>
                                                    <div className="checkout-item__image">
                                                        {item.imageUrl ? (
                                                            <img src={`${API_BASE}/images/${item.imageUrl}`} alt={item.productName} />
                                                        ) : (
                                                            <i className="fa-solid fa-image"></i>
                                                        )}
                                                    </div>
                                                    <div className="checkout-item__info">
                                                        <span className="checkout-item__name">{item.productName}</span>
                                                        <span className="checkout-item__meta">
                                                            SL: {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                        </span>
                                                    </div>
                                                    <span className="checkout-item__total">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="checkout-summary__total">
                                            <span>Tổng cộng</span>
                                            <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CheckoutPage;
