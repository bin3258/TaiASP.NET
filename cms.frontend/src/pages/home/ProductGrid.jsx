import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import cartService from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const API_BASE = 'https://localhost:7068';

const ProductGrid = () => {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productService.getAllProducts();
                setProducts(data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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

    if (loading) {
        return (
            <section className="product-grid">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Đang tải...</span>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="product-grid">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__subtitle">Bộ sưu tập mới nhất</span>
                    <h2 className="section-header__title">Hạt & Ngũ cốc dinh dưỡng</h2>
                    <p className="section-header__desc">Khám phá nguồn dinh dưỡng thuần khiết từ thiên nhiên</p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-5 text-muted">Chưa có sản phẩm nào.</div>
                ) : (
                    <div className="row">
                        {products.slice(0, 4).map((item) => (
                            <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}>
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
                                            <span className="btn product-card__detail-btn">
                                                <i className="fa-solid fa-eye mr-2"></i>Xem chi tiết
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductGrid;
