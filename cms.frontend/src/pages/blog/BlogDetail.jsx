import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import blogService from '../../services/blogService';

const API_BASE = 'https://localhost:7068';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const data = await blogService.getPostById(id);
                setPost(data);
            } catch (error) {
                console.error("Lỗi tải bài viết:", error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <main className="blog-detail-page">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                            <p className="mt-2 text-muted">Đang tải bài viết...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Header />
                <main className="blog-detail-page">
                    <div className="container">
                        <div className="text-center py-5">
                            <i className="fa-solid fa-circle-exclamation fa-3x text-muted mb-3"></i>
                            <p className="text-muted">Không tìm thấy bài viết.</p>
                            <button className="btn blog__view-all mt-3" onClick={() => navigate('/blog')}>
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="blog-detail-page">
                <div className="blog-detail__back">
                    <div className="container">
                        <Link to="/blog" className="blog-detail__back-btn">
                            <i className="fa-solid fa-arrow-left mr-2"></i>Quay lại danh sách
                        </Link>
                    </div>
                </div>

                <article className="blog-detail">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="blog-detail__header">
                                    {post.categoryName && (
                                        <span className="blog-detail__badge">{post.categoryName}</span>
                                    )}
                                    <h1 className="blog-detail__title">{post.title}</h1>
                                    <div className="blog-detail__meta">
                                        <span className="blog-detail__date">
                                            <i className="fa-regular fa-calendar mr-2"></i>
                                            {new Date(post.createdDate).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {post.imageUrl && (
                                    <div className="blog-detail__image-wrap">
                                        <img
                                            src={`${API_BASE}/images/${post.imageUrl}`}
                                            alt={post.title}
                                            className="blog-detail__image"
                                        />
                                    </div>
                                )}

                                <div className="blog-detail__content">
                                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
};

export default BlogDetail;
