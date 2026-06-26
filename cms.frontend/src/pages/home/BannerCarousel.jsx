import React, { useState, useEffect, useCallback } from 'react';
import bannerService from '../../services/bannerService';

const API_BASE = 'https://localhost:7068';

const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                const data = await bannerService.getAllBanners();
                if (Array.isArray(data)) {
                    setBanners(data);
                }
            } catch (error) {
                console.error("Lỗi tải banner:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const prev = useCallback(() => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [banners.length, next]);

    if (loading) {
        return (
            <section className="banner-carousel" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
                <div className="spinner-border text-light" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </section>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <section className="banner-carousel">
            <div className="banner-carousel__inner">
                {banners.map((banner, index) => {
                    const imageSrc = banner.imageUrl?.startsWith('/')
                        ? `${API_BASE}${banner.imageUrl}`
                        : `${API_BASE}/images/${banner.imageUrl}`;

                    return (
                        <div
                            key={banner.id}
                            className={`banner-carousel__slide ${index === current ? 'active' : ''}`}
                        >
                            <img
                                src={imageSrc}
                                alt={banner.title || ''}
                                className="banner-carousel__image"
                            />
                            <div className="banner-carousel__overlay"></div>
                        </div>
                    );
                })}
            </div>

            <button className="banner-carousel__arrow banner-carousel__arrow--left" onClick={prev}>
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="banner-carousel__arrow banner-carousel__arrow--right" onClick={next}>
                <i className="fa-solid fa-chevron-right"></i>
            </button>

            <div className="banner-carousel__dots">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`banner-carousel__dot ${index === current ? 'active' : ''}`}
                        onClick={() => setCurrent(index)}
                    />
                ))}
            </div>
        </section>
    );
};

export default BannerCarousel;
