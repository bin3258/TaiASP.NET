import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import DetailModal from '../product-detail/DetailModal';

const API_BASE = 'https://localhost:7068';

const NewProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await productService.getNewProducts();
                setProducts(data);
            } catch (error) {
                console.error("Lỗi tải SP mới:", error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <section className="product-grid">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"><span className="sr-only">Đang tải...</span></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="product-grid">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__subtitle">Mới về</span>
                    <h2 className="section-header__title">Sản phẩm mới nhất</h2>
                    <p className="section-header__desc">Vừa cập bến - những sản phẩm dinh dưỡng mới nhất</p>
                </div>

                <div className="row">
                    {products.slice(0, 4).map((item) => (
                        <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}>
                            <div className="product-card" onClick={() => setSelectedId(item.id)}>
                                <div className="product-card__image-wrap">
                                    <img
                                        src={`${API_BASE}/images/${item.imageUrl}`}
                                        alt={item.name}
                                        className="product-card__image"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('product-card__image-wrap--no-img'); }}
                                    />
                                </div>
                                <div className="product-card__body">
                                    <h3 className="product-card__title">{item.name}</h3>
                                    <div className="product-card__price">
                                        <span className="product-card__price-current">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedId && <DetailModal type="product" id={selectedId} onClose={() => setSelectedId(null)} />}
        </section>
    );
};

export default NewProducts;
