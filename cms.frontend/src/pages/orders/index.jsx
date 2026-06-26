import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import customersService from '../../services/customersService';

const statusMap = {
    0: { label: 'Chờ duyệt', className: 'status-warning' },
    1: { label: 'Đã duyệt', className: 'status-info' },
    2: { label: 'Đang giao', className: 'status-primary' },
    3: { label: 'Hoàn thành', className: 'status-success' },
    4: { label: 'Đã hủy', className: 'status-danger' }
};

const OrdersPage = () => {
    const { user, initialized } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!initialized) return;

        if (!user?.customerId) {
            navigate('/login');
            return;
        }

        const loadOrders = async () => {
            try {
                setLoading(true);
                const data = await customersService.getOrders(user.customerId);
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải lịch sử mua hàng');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [user, navigate, initialized]);

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
                <main className="orders-page">
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
            <main className="orders-page">
                <div className="container">
                    <h1 className="orders-page__title">Lịch sử mua hàng</h1>

                    {error && <div className="orders-page__error">{error}</div>}

                    {orders.length === 0 ? (
                        <div className="orders-page__empty">
                            <i className="fa-solid fa-box-open fa-3x mb-3" style={{ color: '#ccc' }}></i>
                            <p>Bạn chưa có đơn hàng nào.</p>
                            <Link to="/shop" className="orders-page__shop-link">Mua sắm ngay</Link>
                        </div>
                    ) : (
                        <div className="orders-table-wrapper">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Ngày đặt</th>
                                        <th className="text-center">Số lượng</th>
                                        <th className="text-right">Tổng tiền</th>
                                        <th>Trạng thái</th>
                                        <th className="text-center">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const status = statusMap[order.status] || { label: 'Không xác định', className: '' };
                                        return (
                                            <tr key={order.id}>
                                                <td className="orders-table__id">#{order.id}</td>
                                                <td className="orders-table__date">
                                                    <i className="fa-regular fa-calendar mr-1"></i>
                                                    {formatDate(order.orderDate)}
                                                </td>
                                                <td className="text-center">{order.productCount || 0}</td>
                                                <td className="orders-table__total">{formatPrice(order.total || 0)}</td>
                                                <td>
                                                    <span className={`orders-table__badge ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <Link to={`/orders/${order.id}`} className="orders-table__btn">
                                                        Xem
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default OrdersPage;
