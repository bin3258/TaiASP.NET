import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import reviewService from '../services/reviewService';

const RatingStars = ({ rating, size, interactive, onChange }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating;
        stars.push(
            interactive ? (
                <button
                    key={i}
                    type="button"
                    className={`star-btn ${filled ? 'star-btn--filled' : ''}`}
                    onClick={() => onChange?.(i)}
                >
                    <svg width={size || 22} height={size || 22} viewBox="0 0 24 24" fill={filled ? '#e8a87c' : '#e0e0e0'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            ) : (
                <span key={i} className={`star-display ${filled ? 'star-display--filled' : ''}`}>
                    <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill={filled ? '#e8a87c' : '#e0e0e0'}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </span>
            )
        );
    }
    return <div className="rating-stars">{stars}</div>;
};

const ReviewForm = ({ productId, user, initial, onSubmit, onCancel }) => {
    const fileRef = useRef(null);
    const [rating, setRating] = useState(initial?.rating || 5);
    const [comment, setComment] = useState(initial?.comment || '');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const isEdit = !!initial;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('rating', rating);
            fd.append('comment', comment);
            if (image) fd.append('uploadImage', image);
            await onSubmit(fd);
            setRating(5);
            setComment('');
            setImage(null);
            setPreview(null);
            if (fileRef.current) fileRef.current.value = '';
        } catch (err) {
            setError(err.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <div className="review-form__body">
                <div className="review-form__avatar">
                    {user?.fullName?.charAt(0)?.toUpperCase() || <i className="fa-solid fa-user"></i>}
                </div>
                <div className="review-form__fields">
                    <div className="review-form__rating">
                        <span className="review-form__label">Chất lượng sản phẩm</span>
                        <RatingStars rating={rating} size={26} interactive onChange={setRating} />
                    </div>
                    <textarea
                        className="review-form__textarea"
                        rows="2"
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        required
                    />
                    <div className="review-form__tools">
                        <div className="review-form__upload">
                            <button type="button" className="review-form__upload-btn" onClick={() => fileRef.current?.click()}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                {image ? 'Đổi ảnh' : 'Thêm hình ảnh'}
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                            {preview && (
                                <div className="review-form__preview">
                                    <img src={preview} alt="preview" />
                                    <button type="button" className="review-form__preview-remove" onClick={() => { setPreview(null); setImage(null); }}>&times;</button>
                                </div>
                            )}
                        </div>
                        <div className="review-form__actions-group">
                            {isEdit && (
                                <button type="button" className="review-form__cancel" onClick={onCancel}>Hủy</button>
                            )}
                            <button type="submit" className="review-form__submit" disabled={submitting || !comment.trim()}>
                                {submitting ? (
                                    <span className="btn-spinner"></span>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                )}
                                {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </div>
                    {error && <p className="review-form__error">{error}</p>}
                </div>
            </div>
        </form>
    );
};

const ReviewList = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            await reviewService.delete(reviewId, user.customerId);
            await loadReviews();
        } catch (err) {
            alert(err.response?.data?.message || 'Xóa thất bại!');
        }
    };

    const loadReviews = useCallback(async () => {
        try {
            const data = await reviewService.getByProduct(productId);
            setReviews(data.reviews || []);
            setSummary({ averageRating: data.averageRating || 0, totalReviews: data.totalReviews || 0 });
        } catch (err) {
            console.error('Lỗi tải đánh giá:', err);
        }
    }, [productId]);

    useEffect(() => {
        if (!productId) return;
        const fetch = async () => {
            setLoading(true);
            await loadReviews();
            setLoading(false);
        };
        fetch();
    }, [productId, loadReviews]);

    const handleCreate = async (fd) => {
        fd.append('productId', productId);
        fd.append('customerId', user.customerId);
        await reviewService.create(fd);
        await loadReviews();
    };

    const handleUpdate = async (reviewId, fd) => {
        await reviewService.update(reviewId, fd);
        setEditingId(null);
        await loadReviews();
    };

    const existingReview = reviews.find(r => r.customerId === user?.customerId);

    return (
        <div className="review-section">
            <div className="review-section__header">
                <div className="review-section__title-group">
                    <span className="review-section__subtitle">Khách hàng đánh giá</span>
                    <h3 className="review-section__title">Đánh giá sản phẩm</h3>
                </div>
                {!loading && summary.totalReviews > 0 && (
                    <div className="review-section__summary">
                        <div className="review-section__summary-stars">
                            <RatingStars rating={Math.round(summary.averageRating)} size={18} />
                        </div>
                        <span className="review-section__summary-avg">{summary.averageRating}</span>
                        <span className="review-section__summary-count">({summary.totalReviews} đánh giá)</span>
                    </div>
                )}
            </div>

            {user && editingId === null && !existingReview && (
                <ReviewForm
                    productId={productId}
                    user={user}
                    onSubmit={handleCreate}
                />
            )}

            {user && editingId !== null && (
                <ReviewForm
                    productId={productId}
                    user={user}
                    initial={reviews.find(r => r.id === editingId)}
                    onSubmit={(fd) => handleUpdate(editingId, fd)}
                    onCancel={() => setEditingId(null)}
                />
            )}

            {!user && (
                <div className="review-login-hint">
                    <div className="review-login-hint__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8a87c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <p><Link to="/login">Đăng nhập</Link> để gửi đánh giá về sản phẩm này</p>
                </div>
            )}

            {loading ? (
                <div className="review-loading">
                    <div className="review-loading__spinner"></div>
                    <span>Đang tải đánh giá...</span>
                </div>
            ) : reviews.length === 0 ? (
                <div className="review-empty">
                    <div className="review-empty__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                    <p className="review-empty__text">Chưa có đánh giá nào</p>
                    <p className="review-empty__sub">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                </div>
            ) : (
                <div className="review-list">
                    {reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <div className="review-card__header">
                                <div className="review-card__avatar" style={{ backgroundColor: `hsl(${(r.customerName?.length * 35) % 360}, 55%, 55%)` }}>
                                    {r.customerName?.charAt(0)?.toUpperCase() || <i className="fa-solid fa-user"></i>}
                                </div>
                                <div className="review-card__info">
                                    <span className="review-card__name">{r.customerName || 'Ẩn danh'}</span>
                                    <div className="review-card__meta">
                                        <RatingStars rating={r.rating} size={13} />
                                        <span className="review-card__date">{new Date(r.createdDate).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                                {user && r.customerId === user.customerId && editingId !== r.id && (
                                    <div className="review-card__actions">
                                        <button
                                            type="button"
                                            className="review-card__edit-btn"
                                            onClick={() => setEditingId(r.id)}
                                            title="Sửa đánh giá"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <button
                                            type="button"
                                            className="review-card__delete-btn"
                                            onClick={() => handleDelete(r.id)}
                                            title="Xóa đánh giá"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {editingId === r.id ? (
                                <div className="review-card__editing-hint">Đang chỉnh sửa đánh giá...</div>
                            ) : (
                                <>
                                    <p className="review-card__comment">{r.comment}</p>
                                    {r.imageUrl && (
                                        <div className="review-card__image-wrap">
                                            <img src={`https://localhost:7068/images/reviews/${r.imageUrl}`} alt="review" className="review-card__image" />
                                        </div>
                                    )}
                                    {r.reply && (
                                        <div className="review-card__reply">
                                            <div className="review-card__reply-line"></div>
                                            <div className="review-card__reply-content">
                                                <div className="review-card__reply-header">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e8a87c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                                                    <strong>Phản hồi từ cửa hàng</strong>
                                                </div>
                                                <p>{r.reply}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
