import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import blogService from '../../services/blogService';

const API_BASE = 'https://localhost:7068';

const BlogPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(
        categoryParam ? Number(categoryParam) : null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogService.getBlogCategories()
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setActiveCategory(categoryParam ? Number(categoryParam) : null);
    }, [categoryParam]);

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const data = activeCategory
                ? await blogService.getPostsByCategory(activeCategory)
                : await blogService.getAllPosts();
            setPosts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải bài viết:", error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        const params = categoryId ? `?category=${categoryId}` : '';
        navigate(`/blog${params}`, { replace: true });
    };

    return (
        <>
            <Header />
            <main className="blog-page">
                <div className="blog-page__hero">
                    <div className="container">
                        <h1 className="blog-page__hero-title">Góc dinh dưỡng</h1>
                        <p className="blog-page__hero-desc">Bí quyết ăn uống lành mạnh và thực đơn khoa học cho cuộc sống khỏe</p>
                    </div>
                </div>

                <div className="container">
                    {categories.length > 0 && (
                        <div className="blog-page__categories">
                            <button
                                className={`blog-page__cat-btn ${activeCategory === null ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(null)}
                            >
                                Tất cả
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`blog-page__cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải bài viết...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fa-solid fa-newspaper fa-3x text-muted mb-3"></i>
                            <p className="text-muted">Chưa có bài viết nào.</p>
                        </div>
                    ) : (
                        <div className="row blog-page__grid">
                            {posts.map((post) => (
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
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BlogPage;
