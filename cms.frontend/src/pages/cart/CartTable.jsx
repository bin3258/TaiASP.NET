import React from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'https://localhost:7068';

const CartTable = ({ items, onUpdateQuantity, onRemove, onClear, loading }) => {
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="cart-empty">
                <i className="fa-solid fa-bag-shopping fa-4x text-muted mb-3"></i>
                <h3>Giỏ hàng trống</h3>
                <p className="text-muted">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <Link to="/shop" className="btn cart-empty__btn">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    const total = items.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="cart-content">
            <div className="cart-table">
                <div className="cart-table__header">
                    <div className="cart-table__col cart-table__col--product">Sản phẩm</div>
                    <div className="cart-table__col cart-table__col--price">Đơn giá</div>
                    <div className="cart-table__col cart-table__col--qty">Số lượng</div>
                    <div className="cart-table__col cart-table__col--total">Tạm tính</div>
                    <div className="cart-table__col cart-table__col--action"></div>
                </div>

                {items.map((item) => (
                    <div className="cart-table__row" key={item.cartId}>
                        <div className="cart-table__col cart-table__col--product">
                            <div className="cart-table__product">
                                <Link to={`/product/${item.productId}`} className="cart-table__product-image">
                                    {item.imageUrl ? (
                                        <img src={`${API_BASE}/images/${item.imageUrl}`} alt={item.productName} />
                                    ) : (
                                        <i className="fa-solid fa-image"></i>
                                    )}
                                </Link>
                                <div className="cart-table__product-info">
                                    <Link to={`/product/${item.productId}`} className="cart-table__product-name">
                                        {item.productName}
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="cart-table__col cart-table__col--price">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </div>
                        <div className="cart-table__col cart-table__col--qty">
                            <div className="cart-table__qty">
                                <button
                                    className="cart-table__qty-btn"
                                    onClick={() => item.quantity > 1 && onUpdateQuantity(item.cartId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                >
                                    <i className="fa-solid fa-minus"></i>
                                </button>
                                <span className="cart-table__qty-value">{item.quantity}</span>
                                <button
                                    className="cart-table__qty-btn"
                                    onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                                    disabled={item.quantity >= item.stockQuantity}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div className="cart-table__col cart-table__col--total">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}
                        </div>
                        <div className="cart-table__col cart-table__col--action">
                            <button className="cart-table__remove" onClick={() => onRemove(item.cartId)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-bottom">
                <button className="cart-bottom__clear" onClick={onClear}>
                    <i className="fa-solid fa-trash-can mr-2"></i>Xoá giỏ hàng
                </button>
                <div className="cart-bottom__summary">
                    <div className="cart-bottom__total">
                        <span>Tổng cộng:</span>
                        <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</strong>
                    </div>
                    <Link to="/checkout" className="cart-bottom__checkout">
                        <i className="fa-solid fa-credit-card mr-2"></i>Tiến hành thanh toán
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartTable;
