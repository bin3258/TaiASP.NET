import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="row">
                    <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
                        <div className="footer__brand">
                            <span className="footer__logo">NUTRI<span className="footer__logo-dot">.</span></span>
                            <p className="footer__desc">
                                Cửa hàng thực phẩm dinh dưỡng & đồ ăn vặt lành mạnh. 
                                Chúng tôi mang đến những sản phẩm hạt, ngũ cốc và trà thảo mộc 
                                chất lượng nhất cho sức khỏe của bạn.
                            </p>
                            <div className="footer__social">
                                <button className="footer__social-link" aria-label="Facebook" onClick={(e) => e.preventDefault()}>
                                    <i className="fa-brands fa-facebook-f"></i>
                                </button>
                                <button className="footer__social-link" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
                                    <i className="fa-brands fa-instagram"></i>
                                </button>
                                <button className="footer__social-link" aria-label="TikTok" onClick={(e) => e.preventDefault()}>
                                    <i className="fa-brands fa-tiktok"></i>
                                </button>
                                <button className="footer__social-link" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
                                    <i className="fa-brands fa-youtube"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                        <div className="footer__col">
                            <h4 className="footer__heading">Danh mục</h4>
                            <ul className="footer__links">
                                <li><a href="/shop">Các loại hạt</a></li>
                                <li><a href="/shop">Ngũ cốc nguyên cám</a></li>
                                <li><a href="/shop">Trà thảo mộc</a></li>
                                <li><a href="/shop">Đồ ăn vặt healthy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
                        <div className="footer__col">
                            <h4 className="footer__heading">Hỗ trợ</h4>
                            <ul className="footer__links">
                                <li><a href="/about">Về chúng tôi</a></li>
                                <li><a href="/contact">Liên hệ</a></li>
                                <li><a href="/return-policy">Chính sách đổi trả</a></li>
                                <li><a href="/shipping-policy">Chính sách vận chuyển</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-lg-4 col-md-6">
                        <div className="footer__col">
                            <h4 className="footer__heading">Liên hệ</h4>
                            <ul className="footer__contact">
                                <li>
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span>123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                                </li>
                                <li>
                                    <i className="fa-solid fa-phone"></i>
                                    <span>1900 1234 5678</span>
                                </li>
                                <li>
                                    <i className="fa-solid fa-envelope"></i>
                                    <span>hello@nutristore.vn</span>
                                </li>
                                <li>
                                    <i className="fa-regular fa-clock"></i>
                                    <span>8:00 - 21:00 (T2 - CN)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer__bottom">
                <div className="container">
                    <p className="footer__copyright">
                        &copy; {new Date().getFullYear()} Nutri Store. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
