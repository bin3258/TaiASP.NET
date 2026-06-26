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
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
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
            if (selectedCategory) params.categoryId = selectedCategory;
            if (minPrice !== '') params.minPrice = Number(minPrice);
            if (maxPrice !== '') params.maxPrice = Number(maxPrice);

            const data = Object.keys(params).length > 0
                ? await productService.searchProducts(params)
                : await productService.getAllProducts();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi tải sản phẩm:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, minPrice, maxPrice]);

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
