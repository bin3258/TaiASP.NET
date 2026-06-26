import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import blogService from '../../services/blogService';

const API_BASE = 'https://localhost:7068';

const DetailModal = ({ type, id, onClose }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setLoading(true);
                const fn = type === 'product'
                    ? productService.getProductById
                    : blogService.getPostById;
                const result = await fn(id);
                setData(result);
            } catch (error) {
                console.error(`Lỗi tải chi tiết ${type}:`, error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [type, id]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                {loading ? (
                    <div className="modal-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Đang tải...</span>
                        </div>
                    </div>
                ) : data ? (
                    type === 'product' ? (
                        <div className="modal-detail">
                            <div className="modal-detail__image-wrap">
                                {data.imageUrl ? (
                                    <img
                                        src={`${API_BASE}/images/${data.imageUrl}`}
                                        alt={data.name}
                                        className="modal-detail__image"
                                    />
                                ) : (
                                    <div className="modal-detail__placeholder">
                                        <i className="fa-solid fa-image"></i>
                                    </div>
                                )}
                            </div>
                            <div className="modal-detail__info">
                                <h2 className="modal-detail__title">{data.name}</h2>
                                <div className="modal-detail__price">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)}
                                </div>
                                {data.description && (
                                    <p className="modal-detail__desc">{data.description}</p>
                                )}
                                <div className="modal-detail__meta">
                                    <span className="modal-detail__stock">
                                        <i className="fa-solid fa-box mr-2"></i>
                                        Tồn kho: {data.stockQuantity} sản phẩm
                                    </span>
                                </div>
                                <button className="btn modal-detail__add-btn">
                                    <i className="fa-solid fa-cart-plus mr-2"></i>Thêm vào giỏ hàng
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="modal-detail modal-detail--blog">
                            <div className="modal-detail__image-wrap">
                                {data.imageUrl ? (
                                    <img
                                        src={`${API_BASE}/images/${data.imageUrl}`}
                                        alt={data.title}
                                        className="modal-detail__image"
                                    />
                                ) : (
                                    <div className="modal-detail__placeholder">
                                        <i className="fa-solid fa-leaf"></i>
                                    </div>
                                )}
                                {data.categoryName && (
                                    <span className="modal-detail__category">{data.categoryName}</span>
                                )}
                            </div>
                            <div className="modal-detail__info">
                                <span className="modal-detail__date">
                                    <i className="fa-regular fa-calendar mr-2"></i>
                                    {new Date(data.createdDate).toLocaleDateString('vi-VN')}
                                </span>
                                <h2 className="modal-detail__title">{data.title}</h2>
                                <p className="modal-detail__content">
                                    {data.content || data.shortDescription || 'Đang cập nhật nội dung...'}
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="modal-loading">
                        <p className="text-muted">Không tìm thấy dữ liệu.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailModal;
