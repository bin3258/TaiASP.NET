import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LoadingOrEmpty from '../shop/LoadingOrEmpty';
import productService from '../../services/productService';
import categoryProductService from '../../services/categoryProductService';

const API_BASE = 'https://localhost:7068';

const formatNum = (str) => {
    const num = str.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString('de-DE') : '';
};

const unformatNum = (str) => str.replace(/\./g, '');

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [name, setName] = useState(searchParams.get('q') || '');
    const [minPriceDisplay, setMinPriceDisplay] = useState(
        searchParams.get('minPrice') ? formatNum(searchParams.get('minPrice')) : ''
    );
    const [maxPriceDisplay, setMaxPriceDisplay] = useState(
        searchParams.get('maxPrice') ? formatNum(searchParams.get('maxPrice')) : ''
    );
    const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const searchNameRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        categoryProductService.getAllCategoryProducts()
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchNameRef.current && !searchNameRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const q = name.trim();
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
    }, [name]);

    const doSearch = useCallback(async (params) => {
        try {
            setLoading(true);
            const cleanParams = {};
            if (params.name) cleanParams.name = params.name;
            if (params.minPrice) cleanParams.minPrice = Number(params.minPrice);
            if (params.maxPrice) cleanParams.maxPrice = Number(params.maxPrice);
            if (params.categoryId) cleanParams.categoryId = Number(params.categoryId);
            const data = await productService.searchProducts(cleanParams);
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        const min = searchParams.get('minPrice') || '';
        const max = searchParams.get('maxPrice') || '';
        const cat = searchParams.get('category') || '';
        if (q || min || max || cat) {
            doSearch({ name: q, minPrice: min, maxPrice: max, categoryId: cat });
        }
    }, [searchParams, doSearch]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (name) params.q = name;
        const rawMin = unformatNum(minPriceDisplay);
        const rawMax = unformatNum(maxPriceDisplay);
        if (rawMin) params.minPrice = rawMin;
        if (rawMax) params.maxPrice = rawMax;
        if (categoryId) params.category = categoryId;
        setSearchParams(params);
    };

    const hasFilters = searchParams.toString().length > 0;

    return (
        <>
            <Header />
            <main className="search-page">
                <div className="search-page__hero">
                    <div className="container">
                        <h1 className="search-page__hero-title">Tìm kiếm sản phẩm</h1>
                        <p className="search-page__hero-desc">Khám phá hạt & ngũ cốc dinh dưỡng cho sức khỏe của bạn</p>
                    </div>
                </div>

                <div className="search-page__filters">
                    <div className="container">
                        <form className="search-page__form" onSubmit={handleSearch}>
                            <div className="search-page__form-row">
                                <div className="search-page__field search-page__field--name" ref={searchNameRef}>
                                    <input
                                        type="text"
                                        placeholder="Tên sản phẩm..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        onKeyDown={(e) => e.key === 'Escape' && setShowSuggestions(false)}
                                    />
                                    {suggestionsLoading && (
                                        <span className="search-page__field-spinner">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        </span>
                                    )}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="search-page__suggestions">
                                            {suggestions.map(p => (
                                                <div key={p.id}
                                                    className="search-page__suggestion-item"
                                                    onMouseDown={() => {
                                                        setShowSuggestions(false);
                                                        navigate(`/product/${p.id}`);
                                                    }}
                                                >
                                                    <div className="search-page__suggestion-img">
                                                        {p.imageUrl ? (
                                                            <img src={`${API_BASE}/images/${p.imageUrl}`} alt={p.name} />
                                                        ) : (
                                                            <i className="fa-solid fa-image"></i>
                                                        )}
                                                    </div>
                                                    <div className="search-page__suggestion-info">
                                                        <span className="search-page__suggestion-name">{p.name}</span>
                                                        <span className="search-page__suggestion-price">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="search-page__field">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Giá từ"
                                        value={minPriceDisplay}
                                        onChange={(e) => setMinPriceDisplay(formatNum(e.target.value))}
                                    />
                                </div>
                                <div className="search-page__field">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Giá đến"
                                        value={maxPriceDisplay}
                                        onChange={(e) => setMaxPriceDisplay(formatNum(e.target.value))}
                                    />
                                </div>
                                <div className="search-page__field">
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                        <option value="">Tất cả danh mục</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="search-page__submit">
                                    <i className="fa-solid fa-search mr-2"></i>Tìm kiếm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="container">
                    {hasFilters && (
                        <div className="search-page__info">
                            <span>{products.length} kết quả tìm thấy</span>
                            <Link to="/search" className="search-page__clear">
                                <i className="fa-solid fa-rotate-left mr-1"></i>Xoá bộ lọc
                            </Link>
                        </div>
                    )}

                    <LoadingOrEmpty
                        loading={loading}
                        isEmpty={!loading && products.length === 0 && hasFilters}
                        message="Không tìm thấy sản phẩm phù hợp."
                    />

                    {!loading && products.length > 0 && (
                        <div className="row search-page__results">
                            {products.map((item) => (
                                <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={item.id}>
                                    <Link to={`/product/${item.id}`} className="product-card-link">
                                        <div className="product-card">
                                            <div className="product-card__image-wrap">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={`${API_BASE}/images/${item.imageUrl}`}
                                                        alt={item.name}
                                                        className="product-card__image"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.classList.add('product-card__image-wrap--no-img');
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="product-card__placeholder">
                                                        <i className="fa-solid fa-image"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="product-card__body">
                                                <h3 className="product-card__title">{item.name}</h3>
                                                <div className="product-card__price">
                                                    <span className="product-card__price-current">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="product-card__desc-text">{item.description}</p>
                                                )}
                                                <div className="product-card__meta">
                                                    <span className="product-card__stock">
                                                        <i className="fa-solid fa-box mr-1"></i>
                                                        {item.stockQuantity > 0 ? `${item.stockQuantity} sp` : 'Hết hàng'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {!hasFilters && !loading && (
                        <div className="search-page__empty-state">
                            <i className="fa-solid fa-search fa-4x text-muted mb-3"></i>
                            <p className="text-muted">Nhập từ khóa và chọn bộ lọc để tìm kiếm sản phẩm</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default SearchPage;
