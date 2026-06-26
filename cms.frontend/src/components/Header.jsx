import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import categoryProductService from '../services/categoryProductService';
import productService from '../services/productService';

const API_BASE = 'https://localhost:7068';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount, refreshCart } = useCart();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [productCategories, setProductCategories] = useState([]);
    const [blogCategories, setBlogCategories] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        refreshCart(user?.customerId);
    }, [user, refreshCart]);

    useEffect(() => {
        categoryProductService.getAllCategoryProducts()
            .then(data => { if (Array.isArray(data)) setProductCategories(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetch(`${API_BASE}/api/Categories`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setBlogCategories(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(null);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const q = searchQuery.trim();
        if (!q) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setSuggestionsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await productService.searchProducts({ name: q });
                setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
                setShowSuggestions(true);
            } catch {
                setSuggestions([]);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (productId) => {
        setShowSuggestions(false);
        setSearchQuery('');
        navigate(`/product/${productId}`);
    };

    const handleSearchFocus = () => {
        setSearchOpen(true);
        if (suggestions.length > 0) setShowSuggestions(true);
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            if (!searchQuery) setSearchOpen(false);
        }, 200);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setShowSuggestions(false);
            e.target.blur();
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const handleNavClick = (key) => {
        if (menuOpen) {
            setDropdownOpen(dropdownOpen === key ? null : key);
        }
    };

    const closeAll = () => {
        setDropdownOpen(null);
        setMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header__top">
                <div className="container">
                    <div className="header__wrapper">
                        <div className="header__logo">
                            <Link to="/">
                                <span className="header__logo-text">NUTRI</span>
                                <span className="header__logo-dot">.</span>
                            </Link>
                        </div>

                        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
                            <Link to="/" className="header__nav-link" onClick={closeAll}>Trang chủ</Link>

                            <div className="header__nav-item"
                                onMouseEnter={() => !menuOpen && setDropdownOpen('product')}
                                onMouseLeave={() => !menuOpen && setDropdownOpen(null)}>
                                <span className={`header__nav-link header__nav-link--dropdown ${dropdownOpen === 'product' ? 'active' : ''}`}
                                    onClick={() => handleNavClick('product')}>
                                    Sản phẩm <i className="fa-solid fa-chevron-down header__nav-arrow"></i>
                                </span>
                                {dropdownOpen === 'product' && (
                                    <div className="header__dropdown">
                                        <Link to="/shop" className="header__dropdown-item" onClick={closeAll}>
                                            <i className="fa-solid fa-th-large"></i> Tất cả sản phẩm
                                        </Link>
                                        {productCategories.map(cat => (
                                            <Link key={cat.id} to={`/shop?category=${cat.id}`} className="header__dropdown-item" onClick={closeAll}>
                                                {cat.imageUrl ? <img src={`${API_BASE}/images/${cat.imageUrl}`} alt="" className="header__dropdown-icon" /> : <i className="fa-solid fa-tag"></i>}
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="header__nav-item"
                                onMouseEnter={() => !menuOpen && setDropdownOpen('blog')}
                                onMouseLeave={() => !menuOpen && setDropdownOpen(null)}>
                                <span className={`header__nav-link header__nav-link--dropdown ${dropdownOpen === 'blog' ? 'active' : ''}`}
                                    onClick={() => handleNavClick('blog')}>
                                    Góc dinh dưỡng <i className="fa-solid fa-chevron-down header__nav-arrow"></i>
                                </span>
                                {dropdownOpen === 'blog' && (
                                    <div className="header__dropdown">
                                        <Link to="/blog" className="header__dropdown-item" onClick={closeAll}>
                                            <i className="fa-solid fa-th-large"></i> Tất cả bài viết
                                        </Link>
                                        {blogCategories.map(cat => (
                                            <Link key={cat.id} to={`/blog?category=${cat.id}`} className="header__dropdown-item" onClick={closeAll}>
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link to="/about" className="header__nav-link" onClick={closeAll}>Giới thiệu</Link>
                            <Link to="/contact" className="header__nav-link" onClick={closeAll}>Liên hệ</Link>
                        </nav>

                        <div className="header__actions">
                            <form className={`header__search ${searchOpen ? 'header__search--open' : ''}`} onSubmit={handleSearch}>
                                <div className="header__search-wrap" ref={searchRef}>
                                    <input
                                        type="text"
                                        className="header__search-input"
                                        placeholder="Tìm kiếm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={handleSearchFocus}
                                        onBlur={handleSearchBlur}
                                        onKeyDown={handleKeyDown}
                                    />
                                    {suggestionsLoading && (
                                        <span className="header__search-spinner">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        </span>
                                    )}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="header__suggestions">
                                            {suggestions.map(p => (
                                                <div key={p.id}
                                                    className="header__suggestion-item"
                                                    onMouseDown={() => handleSuggestionClick(p.id)}
                                                >
                                                    <div className="header__suggestion-img">
                                                        {p.imageUrl ? (
                                                            <img src={`${API_BASE}/images/${p.imageUrl}`} alt={p.name} />
                                                        ) : (
                                                            <i className="fa-solid fa-image"></i>
                                                        )}
                                                    </div>
                                                    <div className="header__suggestion-info">
                                                        <span className="header__suggestion-name">{p.name}</span>
                                                        <span className="header__suggestion-price">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="header__suggestion-all"
                                                onMouseDown={() => {
                                                    setShowSuggestions(false);
                                                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                                }}
                                            >
                                                <i className="fa-solid fa-search mr-2"></i>Xem tất cả kết quả
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button type="button" className="header__search-btn" onClick={() => navigate('/search')}>
                                    <i className="fa-solid fa-search"></i>
                                </button>
                            </form>

                            {user ? (
                                <div className="header__user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                    <span className="header__user-name">{user.fullName}</span>
                                    <i className="fa-solid fa-chevron-down header__user-arrow"></i>
                                    {userMenuOpen && (
                                        <div className="header__user-dropdown">
                                            <Link to="/account" className="header__user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-regular fa-user mr-2"></i>Tài khoản
                                            </Link>
                                            <Link to="/orders" className="header__user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                                                <i className="fa-solid fa-box mr-2"></i>Đơn hàng
                                            </Link>
                                            <button className="header__user-dropdown-item header__user-dropdown-item--danger" onClick={handleLogout}>
                                                <i className="fa-solid fa-right-from-bracket mr-2"></i>Đăng xuất
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link to="/login" className="header__auth-link">
                                    <i className="fa-regular fa-user mr-1"></i> Đăng nhập
                                </Link>
                            )}

                            <Link to="/cart" className="header__cart">
                                <i className="fa-solid fa-bag-shopping"></i>
                                {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
                            </Link>

                            <button className="header__hamburger d-lg-none" onClick={() => setMenuOpen(!menuOpen)}>
                                <span></span><span></span><span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
