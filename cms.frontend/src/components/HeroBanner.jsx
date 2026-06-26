import React from 'react';

const HeroBanner = () => {
    return (
        <section className="hero">
            <div className="hero__overlay"></div>
            <div className="container hero__container">
                <div className="hero__content">
                    <span className="hero__subtitle">Dinh dưỡng lành mạnh 2026</span>
                    <h1 className="hero__title">Sống <span className="hero__title-accent">khỏe</span> mỗi ngày<br />với <span className="hero__title-accent">hạt & ngũ cốc</span></h1>
                    <p className="hero__desc">
                        Khám phá bộ sưu tập các loại hạt dinh dưỡng, ngũ cốc nguyên cám 
                        và trà thảo mộc thuần khiết - Nguồn năng lượng xanh cho cơ thể khỏe mạnh.
                    </p>
                    <div className="hero__actions">
                        <a href="/shop" className="btn hero__btn hero__btn--primary">
                            Mua ngay <i className="fa-solid fa-arrow-right ml-2"></i>
                        </a>
                        <a href="/blog" className="btn hero__btn hero__btn--outline">
                            Khám phá thêm
                        </a>
                    </div>
                </div>
                <div className="hero__visual">
                    <div className="hero__badge hero__badge--1">
                        <span className="hero__badge-number">50+</span>
                        <span className="hero__badge-text">Sản phẩm</span>
                    </div>
                    <div className="hero__badge hero__badge--2">
                        <span className="hero__badge-number">5K+</span>
                        <span className="hero__badge-text">Khách hàng</span>
                    </div>
                </div>
            </div>
            <div className="hero__scroll">
                <span>Cuộn xuống</span>
                <i className="fa-solid fa-chevron-down"></i>
            </div>
        </section>
    );
};

export default HeroBanner;
