import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import customersService from '../../services/customersService';

const API_BASE = 'https://localhost:7068';

const statusMap = {
    0: { label: 'Chờ duyệt', className: 'status-warning' },
    1: { label: 'Đã duyệt', className: 'status-info' },
    2: { label: 'Đang giao', className: 'status-primary' },
    3: { label: 'Hoàn thành', className: 'status-success' },
    4: { label: 'Đã hủy', className: 'status-danger' }
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const { user, initialized } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!initialized) return;

        if (!user?.customerId) {
            navigate('/login');
            return;
        }

        const loadOrder = async () => {
            try {
                setLoading(true);
                const data = await customersService.getOrderDetail(id);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id, user, navigate, initialized]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="order-detail-page">
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

    if (error || !order) {
        return (
            <>
                <Header />
                <main className="order-detail-page">
                    <div className="container">
                        <div className="text-center py-5">
                            <p className="text-danger">{error || 'Không tìm thấy đơn hàng'}</p>
                            <Link to="/orders" className="btn btn-primary">Quay lại</Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const status = statusMap[order.status] || { label: 'Không xác định', className: '' };
    const total = Array.isArray(order.products)
        ? order.products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
        : 0;

    return (
        <>
            <Header />
            <main className="order-detail-page">
                <div className="container">
                    <Link to="/orders" className="order-detail-page__back">
                        <i className="fa-solid fa-arrow-left mr-2"></i>Quay lại
                    </Link>

                    <div className="order-detail-page__header">
                        <h1>Đơn hàng #{order.id}</h1>
                        <span className={`order-detail-page__status ${status.className}`}>
                            {status.label}
                        </span>
                    </div>

                    <div className="order-detail-page__info">
                        <div className="order-detail-page__info-item">
                            <span className="order-detail-page__info-label">Ngày đặt</span>
                            <span className="order-detail-page__info-value">{formatDate(order.orderDate)}</span>
                        </div>
                        {order.notes && (
                            <div className="order-detail-page__info-item">
                                <span className="order-detail-page__info-label">Ghi chú</span>
                                <span className="order-detail-page__info-value">{order.notes}</span>
                            </div>
                        )}
                    </div>

                    <h2 className="order-detail-page__section-title">Sản phẩm</h2>

                    <div className="order-detail-page__products">
                        {order.products.map((product, index) => (
                            <div className="order-detail-page__product" key={index}>
                                <Link to={`/product/${product.productId}`} className="order-detail-page__product-image-link">
                                    <div className="order-detail-page__product-image">
                                        {product.imageUrl ? (
                                            <img src={`${API_BASE}/images/${product.imageUrl}`} alt={product.productName} />
                                        ) : (
                                            <i className="fa-solid fa-image"></i>
                                        )}
                                    </div>
                                </Link>
                                <div className="order-detail-page__product-info">
                                    <Link to={`/product/${product.productId}`} className="order-detail-page__product-name">{product.productName}</Link>
                                    <span className="order-detail-page__product-meta">
                                        SL: {product.quantity} x {formatPrice(product.unitPrice)}
                                    </span>
                                </div>
                                <span className="order-detail-page__product-total">
                                    {formatPrice(product.quantity * product.unitPrice)}
                                </span>
                                {order.status === 3 && (
                                    <Link to={`/review/${product.productId}`} className="order-detail-page__review-btn">
                                        <i className="fa-solid fa-star"></i> Đánh giá
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="order-detail-page__total">
                        <span>Tổng cộng</span>
                        <strong>{formatPrice(total)}</strong>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default OrderDetailPage;
