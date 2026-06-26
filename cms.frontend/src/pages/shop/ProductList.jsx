import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import cartService from '../../services/cartService';

const API_BASE = 'https://localhost:7068';

const ProductList = ({ products }) => {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const [addingId, setAddingId] = useState(null);

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.customerId) {
            navigate('/login');
            return;
        }

        if (product.stockQuantity <= 0) return;

        setAddingId(product.id);
        try {
            await cartService.addToCart({
                customerId: user.customerId,
                productId: product.id,
                quantity: 1
            });
            refreshCart(user.customerId);
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="row product-grid" key={products[0]?.id + '-' + products.length}>
            {products.map((item, index) => (
                <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}
                    style={{ '--delay': `${index * 0.06}s` }}>
                    <Link to={`/product/${item.id}`} className="product-card-link">
                        <div className="product-card">
                            <div className="product-card__image-wrap">
                                {item.imageUrl ? (
                                    <img
                                        src={`${API_BASE}/images/${item.imageUrl}`}
                                        alt={item.name}
                                        className="product-card__image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add('product-card__image-wrap--no-img');
                                        }}
                                    />
                                ) : (
                                    <div className="product-card__placeholder">
                                        <i className="fa-solid fa-image"></i>
                                    </div>
                                )}
                                <div className="product-card__actions">
                                    <button className="product-card__action-btn" title="Thêm vào giỏ"
                                        onClick={(e) => handleAddToCart(e, item)}
                                        disabled={addingId === item.id || item.stockQuantity <= 0}>
                                        {addingId === item.id ? (
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fa-solid fa-bag-shopping"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="product-card__body">
                                <h3 className="product-card__title">{item.name}</h3>
                                <div className="product-card__price">
                                    <span className="product-card__price-current">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </span>
                                </div>
                                <div className="product-card__meta">
                                    <span className="product-card__stock">
                                        <i className="fa-solid fa-box mr-1"></i>
                                        {item.stockQuantity > 0 ? `${item.stockQuantity} sp` : 'Hết hàng'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default ProductList;
