import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AboutPage = () => {
    return (
        <>
            <Header />
            <main className="page-hero page-hero--about">
                <div className="page-hero__overlay"></div>
                <div className="container">
                    <div className="page-hero__content">
                        <h1 className="page-hero__title">Về chúng tôi</h1>
                        <p className="page-hero__desc">
                            Hành trình mang đến những sản phẩm dinh dưỡng tốt nhất cho sức khỏe của bạn
                        </p>
                    </div>
                </div>
            </main>

            <section className="about-story">
                <div className="container">
                    <div className="about-story__grid">
                        <div className="about-story__image">
                            <img
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80"
                                alt="Về Nutri Store"
                            />
                        </div>
                        <div className="about-story__text">
                            <h2 className="about-story__title">Câu chuyện của chúng tôi</h2>
                            <p>
                                Nutri Store ra đời từ năm 2020 với sứ mệnh mang đến những sản phẩm
                                dinh dưỡng chất lượng cao cho người Việt. Chúng tôi tin rằng một chế
                                độ ăn uống lành mạnh là nền tảng cho một cuộc sống khỏe mạnh.
                            </p>
                            <p>
                                Từ những ngày đầu tiên, chúng tôi đã hợp tác với các nông trại hữu cơ
                                trên khắp cả nước để chọn lọc những hạt ngũ cốc, các loại hạt dinh dưỡng
                                và trà thảo mộc tốt nhất. Mỗi sản phẩm đều trải qua quy trình kiểm định
                                nghiêm ngặt trước khi đến tay khách hàng.
                            </p>
                            <p>
                                Hơn 5 năm hoạt động, Nutri Store tự hào là địa chỉ tin cậy của hàng ngàn
                                gia đình Việt trong việc lựa chọn thực phẩm dinh dưỡng.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-values">
                <div className="container">
                    <h2 className="about-values__title">Giá trị cốt lõi</h2>
                    <div className="about-values__grid">
                        <div className="about-values__card">
                            <div className="about-values__icon">
                                <i className="fa-solid fa-leaf"></i>
                            </div>
                            <h3>Tự nhiên</h3>
                            <p>100% sản phẩm từ thiên nhiên, không chất bảo quản, không hóa chất độc hại.</p>
                        </div>
                        <div className="about-values__card">
                            <div className="about-values__icon">
                                <i className="fa-solid fa-award"></i>
                            </div>
                            <h3>Chất lượng</h3>
                            <p>Cam kết sản phẩm đạt chuẩn vệ sinh an toàn thực phẩm, kiểm định định kỳ.</p>
                        </div>
                        <div className="about-values__card">
                            <div className="about-values__icon">
                                <i className="fa-solid fa-hand-holding-heart"></i>
                            </div>
                            <h3>Tận tâm</h3>
                            <p>Đội ngũ nhân viên giàu kinh nghiệm, tư vấn tận tình vì sức khỏe của bạn.</p>
                        </div>
                        <div className="about-values__card">
                            <div className="about-values__icon">
                                <i className="fa-solid fa-recycle"></i>
                            </div>
                            <h3>Bền vững</h3>
                            <p>Cam kết bảo vệ môi trường qua bao bì thân thiện và quy trình sản xuất xanh.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-stats">
                <div className="container">
                    <div className="about-stats__grid">
                        <div className="about-stats__item">
                            <span className="about-stats__number">500+</span>
                            <span className="about-stats__label">Sản phẩm chất lượng</span>
                        </div>
                        <div className="about-stats__item">
                            <span className="about-stats__number">50.000+</span>
                            <span className="about-stats__label">Khách hàng tin tưởng</span>
                        </div>
                        <div className="about-stats__item">
                            <span className="about-stats__number">5+</span>
                            <span className="about-stats__label">Năm kinh nghiệm</span>
                        </div>
                        <div className="about-stats__item">
                            <span className="about-stats__number">63</span>
                            <span className="about-stats__label">Tỉnh thành phủ sóng</span>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default AboutPage;
