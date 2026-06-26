import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ContactPage = () => {
    return (
        <>
            <Header />
            <main className="page-hero page-hero--contact">
                <div className="page-hero__overlay"></div>
                <div className="container">
                    <div className="page-hero__content">
                        <h1 className="page-hero__title">Liên hệ</h1>
                        <p className="page-hero__desc">
                            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                        </p>
                    </div>
                </div>
            </main>

            <section className="contact-section">
                <div className="container">
                    <div className="contact-section__grid">
                        <div className="contact-section__info">
                            <h2 className="contact-section__heading">Thông tin liên hệ</h2>
                            <p className="contact-section__sub">
                                Đừng ngần ngại liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.
                            </p>

                            <div className="contact-section__item">
                                <div className="contact-section__icon">
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <div>
                                    <h4>Địa chỉ</h4>
                                    <p>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                                </div>
                            </div>

                            <div className="contact-section__item">
                                <div className="contact-section__icon">
                                    <i className="fa-solid fa-phone"></i>
                                </div>
                                <div>
                                    <h4>Số điện thoại</h4>
                                    <p>1900 1234 5678</p>
                                </div>
                            </div>

                            <div className="contact-section__item">
                                <div className="contact-section__icon">
                                    <i className="fa-solid fa-envelope"></i>
                                </div>
                                <div>
                                    <h4>Email</h4>
                                    <p>hello@nutristore.vn</p>
                                </div>
                            </div>

                            <div className="contact-section__item">
                                <div className="contact-section__icon">
                                    <i className="fa-regular fa-clock"></i>
                                </div>
                                <div>
                                    <h4>Giờ làm việc</h4>
                                    <p>8:00 - 21:00 (Thứ 2 - Chủ nhật)</p>
                                </div>
                            </div>
                        </div>

                        <div className="contact-section__form">
                            <h2 className="contact-section__heading">Gửi tin nhắn</h2>
                            <p className="contact-section__sub">
                                Điền form bên dưới, chúng tôi sẽ phản hồi trong vòng 24 giờ.
                            </p>

                            <form onSubmit={(e) => e.preventDefault()}>
                                <div className="contact-field">
                                    <label>Họ và tên</label>
                                    <input type="text" placeholder="Nguyễn Văn A" required />
                                </div>
                                <div className="contact-field">
                                    <label>Email</label>
                                    <input type="email" placeholder="email@example.com" required />
                                </div>
                                <div className="contact-field">
                                    <label>Tiêu đề</label>
                                    <input type="text" placeholder="Tiêu đề tin nhắn" required />
                                </div>
                                <div className="contact-field">
                                    <label>Nội dung</label>
                                    <textarea rows="5" placeholder="Nội dung tin nhắn..." required></textarea>
                                </div>
                                <button type="submit" className="contact-section__btn">
                                    <i className="fa-solid fa-paper-plane mr-2"></i>
                                    Gửi tin nhắn
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-map">
                <iframe
                    title="Vị trí Nutri Store"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.424222222209!2d106.698667!3d10.776889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3b0c8b0b0b%3A0x0!2zMTDCsDQ2JzM2LjgiTiAxMDbCsDQxJzU1LjIiRQ!5e0!3m2!1svi!2s!4v1"
                    allowFullScreen=""
                    loading="lazy"
                    title="Bản đồ"
                ></iframe>
            </section>

            <Footer />
        </>
    );
};

export default ContactPage;
