import React, { useState, useEffect } from 'react';
import blogService from '../../services/blogService';

const API_BASE = 'https://localhost:7068';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const data = await blogService.getAllPosts();
                setPosts(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách bài viết:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return <div className="text-center my-4">Đang tải tin tức thời trang...</div>;
    }

    return (
        <div className="mt-5">
            <h4 className="mb-4 text-uppercase text-secondary font-weight-bold border-bottom pb-2">
                <i className="fa-solid fa-newspaper text-info mr-2"></i> Xu hướng & Bí quyết mặc đẹp
            </h4>
            
            {posts.length === 0 ? (
                <p className="text-muted">Chưa có bài viết tin tức nào.</p>
            ) : (
                <div className="row">
                    {posts.map((post) => (
                        <div className="col-12 mb-3" key={post.id}>
                            <div className="card shadow-sm border-light overflow-hidden">
                                <div className="row no-gutters">
                                    {post.imageUrl && (
                                        <div className="col-md-4">
                                            <img
                                                src={`${API_BASE}/images/${post.imageUrl}`}
                                                alt={post.title}
                                                className="card-img h-100"
                                                style={{ objectFit: 'cover', minHeight: '200px' }}
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                    <div className={post.imageUrl ? 'col-md-8' : 'col-12'}>
                                        <div className="card-body">
                                            <h5 className="card-title font-weight-bold">
                                                <a href={`/post/${post.id}`} className="text-dark text-decoration-none hover-link">
                                                    {post.title}
                                                </a>
                                            </h5>
                                            <p className="card-text text-muted small">
                                                {post.shortDescription || 'Đang cập nhật nội dung tóm tắt cho bài viết...'}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center text-secondary small">
                                                <span>
                                                    <i className="fa-regular fa-calendar mr-1"></i>
                                                    {new Date(post.createdDate).toLocaleDateString('vi-VN')}
                                                </span>
                                                {post.categoryName && (
                                                    <span className="badge badge-secondary px-2 py-1">{post.categoryName}</span>
                                                )}
                                                <span className="badge badge-info px-2 py-1">Xem thêm</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostList;
