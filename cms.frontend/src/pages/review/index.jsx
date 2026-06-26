import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ReviewList from '../../components/ReviewList';
import productService from '../../services/productService';

const API_BASE = 'https://localhost:7068';

const ReviewPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(productId);
                setProduct(data);
            } catch (err) {
                console.error('Lỗi tải sản phẩm:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [productId]);

    return (
        <div className="app">
            <Header />
            <main className="review-page">
                <div className="container">
                    <div className="review-page__breadcrumb">
                        <Link to="/shop">Cửa hàng</Link>
                        <span className="review-page__breadcrumb-sep">/</span>
                        {product && <Link to={`/product/${product.id}`}>{product.name}</Link>}
                        <span className="review-page__breadcrumb-sep">/</span>
                        <span>Đánh giá</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    ) : product ? (
                        <div className="review-page__content">
                            <div className="review-page__product-card">
                                <Link to={`/product/${product.id}`} className="review-page__product-image-link">
                                    <div className="review-page__product-image">
                                        {product.imageUrl ? (
                                            <img src={`${API_BASE}/images/${product.imageUrl}`} alt={product.name} />
                                        ) : (
                                            <i className="fa-solid fa-image"></i>
                                        )}
                                    </div>
                                </Link>
                                <div className="review-page__product-info">
                                    <Link to={`/product/${product.id}`} className="review-page__product-name">{product.name}</Link>
                                    <span className="review-page__product-price">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                    {product.description && (
                                        <p className="review-page__product-desc">{product.description}</p>
                                    )}
                                </div>
                            </div>

                            <ReviewList productId={Number(productId)} />
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <p className="text-muted">Không tìm thấy sản phẩm.</p>
                            <Link to="/shop" className="btn btn-primary">Tiếp tục mua sắm</Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ReviewPage;
