import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import blogService from '../../services/blogService';

const API_BASE = 'https://localhost:7068';

const LatestBlog = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await blogService.getAllPosts();
                setPosts(data);
            } catch (error) {
                console.error("Lỗi khi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) {
        return (
            <section className="latest-blog">
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
        <section className="latest-blog">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__subtitle">Góc dinh dưỡng</span>
                    <h2 className="section-header__title">Bài viết mới nhất</h2>
                    <p className="section-header__desc">Bí quyết ăn uống lành mạnh và thực đơn giảm cân khoa học</p>
                </div>

                {posts.length === 0 ? (
                    <p className="text-center py-5 text-muted">Chưa có bài viết nào.</p>
                ) : (
                    <div className="row">
                        {posts.slice(0, 3).map((post) => (
                            <div className="col-lg-4 col-md-6 mb-4" key={post.id}>
                                <div className="blog-card" onClick={() => navigate(`/post/${post.id}`)}>
                                    <div className="blog-card__image-wrap">
                                        {post.imageUrl ? (
                                            <img
                                                src={`${API_BASE}/images/${post.imageUrl}`}
                                                alt={post.title}
                                                className="blog-card__image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.classList.add('blog-card__image-wrap--no-img');
                                                }}
                                            />
                                        ) : (
                                            <div className="blog-card__placeholder">
                                                <i className="fa-solid fa-leaf"></i>
                                            </div>
                                        )}
                                        {post.categoryName && (
                                            <span className="blog-card__category">{post.categoryName}</span>
                                        )}
                                    </div>
                                    <div className="blog-card__body">
                                        <span className="blog-card__date">
                                            <i className="fa-regular fa-calendar mr-1"></i>
                                            {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                                        </span>
                                        <h3 className="blog-card__title">{post.title}</h3>
                                        <p className="blog-card__desc">
                                            {post.shortDescription || 'Đang cập nhật nội dung...'}
                                        </p>
                                        <span className="blog-card__link">
                                            Đọc thêm <i className="fa-solid fa-arrow-right ml-1"></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {posts.length > 3 && (
                    <div className="text-center mt-4">
                        <button className="btn blog__view-all" onClick={() => navigate('/blog')}>
                            Xem tất cả bài viết <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LatestBlog;
