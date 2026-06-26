import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import productService from '../../services/productService';
import cartService from '../../services/cartService';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewList from '../../components/ReviewList';

const API_BASE = 'https://localhost:7068';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const maxQuantity = product?.stockQuantity ?? 0;

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                if (data?.categoryProductId) {
                    const related = await productService.getRelatedProducts(data.categoryProductId, Number(id));
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error("Lỗi tải chi tiết sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setAdding(true);
            await cartService.addToCart({
                customerId: user.customerId,
                productId: product.id,
                quantity
            });
            navigate('/cart');
        } catch (error) {
            console.error("Lỗi thêm giỏ hàng:", error);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="app">
            <Header />
            <main className="product-detail-page">
                <div className="product-detail-page__back">
                    <div className="container">
                        <button className="product-detail-page__back-btn" onClick={() => navigate(-1)}>
                            <i className="fa-solid fa-arrow-left mr-2"></i>Quay lại
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                        </div>
                    </div>
                ) : product ? (
                    <>
                    <div className="container">
                        <div className="product-detail">
                            <div className="product-detail__gallery">
                                <div className="product-detail__image-wrap">
                                    {product.imageUrl ? (
                                        <img
                                            src={`${API_BASE}/images/${product.imageUrl}`}
                                            alt={product.name}
                                            className="product-detail__image"
                                        />
                                    ) : (
                                        <div className="product-detail__placeholder">
                                            <i className="fa-solid fa-image"></i>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="product-detail__info">
                                <span className="product-detail__badge">Sản phẩm dinh dưỡng</span>
                                <h1 className="product-detail__name">{product.name}</h1>

                                <div className="product-detail__price">
                                    <span className="product-detail__price-current">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                </div>

                                {product.description && (
                                    <div className="product-detail__desc">
                                        <h3>Mô tả sản phẩm</h3>
                                        <p>{product.description}</p>
                                    </div>
                                )}

                                <div className="product-detail__meta">
                                    <div className="product-detail__meta-item">
                                        <i className="fa-solid fa-box"></i>
                                        <span>Tình trạng: <strong>{product.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</strong></span>
                                    </div>
                                    <div className="product-detail__meta-item">
                                        <i className="fa-solid fa-cubes"></i>
                                        <span>Số lượng: <strong>{product.stockQuantity} sản phẩm</strong></span>
                                    </div>
                                    {product.categoryProductId && (
                                        <div className="product-detail__meta-item">
                                            <i className="fa-solid fa-tag"></i>
                                            <span>Danh mục: <strong>Hạt & Ngũ cốc</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className="product-detail__quantity">
                                    <span className="product-detail__quantity-label">Số lượng:</span>
                                    <div className="product-detail__quantity-controls">
                                        <button
                                            className="product-detail__quantity-btn"
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            disabled={quantity <= 1}
                                        >
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="product-detail__quantity-value">{quantity}</span>
                                        <button
                                            className="product-detail__quantity-btn"
                                            onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                                            disabled={quantity >= maxQuantity}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                    {quantity >= maxQuantity && (
                                        <span className="product-detail__quantity-warning">
                                            <i className="fa-solid fa-circle-exclamation mr-1"></i>Tối đa {maxQuantity} sản phẩm
                                        </span>
                                    )}
                                </div>

                                <div className="product-detail__actions">
                                    <button
                                        className="product-detail__add-btn"
                                        onClick={handleAddToCart}
                                        disabled={adding || product.stockQuantity <= 0}
                                    >
                                        {adding ? (
                                            <span className="spinner-border spinner-border-sm mr-2" role="status"></span>
                                        ) : (
                                            <i className="fa-solid fa-cart-plus mr-2"></i>
                                        )}
                                        {adding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                                    </button>
                                    <button className="product-detail__wish-btn">
                                        <i className="fa-regular fa-heart"></i>
                                    </button>
                                </div>

                                <div className="product-detail__shipping">
                                    <div className="product-detail__shipping-item">
                                        <i className="fa-solid fa-truck"></i>
                                        <span>Miễn phí vận chuyển cho đơn trên 500.000₫</span>
                                    </div>
                                    <div className="product-detail__shipping-item">
                                        <i className="fa-solid fa-rotate-left"></i>
                                        <span>Đổi trả trong 30 ngày</span>
                                    </div>
                                    <div className="product-detail__shipping-item">
                                        <i className="fa-solid fa-shield"></i>
                                        <span>Bảo đảm chất lượng 100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {relatedProducts.length > 0 && (
                        <div className="container mt-5">
                            <h3 className="mb-4" style={{ fontWeight: 700, color: '#1a1a2e' }}>Sản phẩm liên quan</h3>
                            <div className="row g-3">
                                {relatedProducts.map(rp => (
                                    <div key={rp.id} className="col-6 col-md-3">
                                        <Link to={`/product/${rp.id}`} className="text-decoration-none">
                                            <div className="related-product-card">
                                                <div className="related-product-card__image-wrap">
                                                    {rp.imageUrl ? (
                                                        <img src={`${API_BASE}/images/${rp.imageUrl}`} alt={rp.name} className="related-product-card__image" />
                                                    ) : (
                                                        <div className="related-product-card__placeholder">
                                                            <i className="fa-solid fa-image"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="related-product-card__info">
                                                    <h4 className="related-product-card__name">{rp.name}</h4>
                                                    <span className="related-product-card__price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rp.price)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="container mt-5 pb-5">
                        <ReviewList productId={Number(id)} />
                    </div>
                    </>
                ) : (
                    <div className="container">
                        <div className="text-center py-5">
                            <p className="text-muted">Không tìm thấy sản phẩm.</p>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetail;
