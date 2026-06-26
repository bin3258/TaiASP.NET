import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CategoryMenu from '../home/CategoryMenu';
import ShopHeader from './ShopHeader';
import ProductList from './ProductList';
import PriceFilter from './PriceFilter';
import LoadingOrEmpty from './LoadingOrEmpty';
import productService from '../../services/productService';
import categoryProductService from '../../services/categoryProductService';

const ShopPage = () => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const [selectedCategory, setSelectedCategory] = useState(
        categoryParam ? Number(categoryParam) : null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        categoryProductService.getAllCategoryProducts()
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(() => {});
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            const trimmedQuery = searchQuery.trim();

            if (trimmedQuery) params.name = trimmedQuery;
            if (selectedCategory) params.categoryId = selectedCategory;
            if (minPrice !== '') params.minPrice = Number(minPrice);
            if (maxPrice !== '') params.maxPrice = Number(maxPrice);
            if (sortOrder) {
                params.sortBy = 'price';
                params.sortDir = sortOrder;
            }

            const hasFilters = Object.keys(params).length > 0;
            const data = hasFilters
                ? await productService.searchProducts(params)
                : await productService.getAllProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, minPrice, maxPrice, sortOrder]);

    const hasActiveFilters = Boolean(
        searchQuery.trim() || selectedCategory || minPrice !== '' || maxPrice !== '' || sortOrder
    );

    const emptyMessage = searchQuery.trim()
        ? `Không tìm thấy sản phẩm cho từ khóa "${searchQuery.trim()}".`
        : 'Không tìm thấy sản phẩm phù hợp với bộ lọc.';

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchProducts();
        }, 400);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [fetchProducts]);

    return (
        <>
            <Header />
            <CategoryMenu
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
            <main className="shop-page">
                <div className="container">
                    <ShopHeader
                        totalProducts={products.length}
                        selectedCategory={selectedCategory}
                        categories={categories}
                        searchQuery={searchQuery}
                        sortOrder={sortOrder}
                        onSearchChange={setSearchQuery}
                        onSearchClear={() => setSearchQuery('')}
                        onSortChange={setSortOrder}
                    />
                    <div className="shop-content">
                        <aside className="shop-sidebar">
                            <PriceFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                onMinPriceChange={setMinPrice}
                                onMaxPriceChange={setMaxPrice}
                            />
                        </aside>
                        <div className="shop-main">
                            <LoadingOrEmpty
                                loading={loading}
                                isEmpty={!loading && products.length === 0}
                                message={hasActiveFilters ? emptyMessage : undefined}
                            />
                            {!loading && products.length > 0 && (
                                <ProductList products={products} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ShopPage;
