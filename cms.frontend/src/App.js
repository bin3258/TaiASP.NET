import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import BannerCarousel from './pages/home/BannerCarousel';
import HotProducts from './pages/home/HotProducts';
import ProductGrid from './pages/home/ProductGrid';
import LatestBlog from './pages/home/LatestBlog';
import Footer from './components/Footer';
import ProductDetail from './pages/product-detail/ProductDetail';
import ReviewPage from './pages/review';
import ShopPage from './pages/shop/index';
import BlogPage from './pages/blog/index';
import BlogDetail from './pages/blog/BlogDetail';
import SearchPage from './pages/search/index';
import CartPage from './pages/cart/index';
import CheckoutPage from './pages/checkout/index';
import AccountPage from './pages/account/index';
import OrdersPage from './pages/orders/index';
import OrderDetailPage from './pages/orders/OrderDetail';
import AboutPage from './pages/about/index';
import ContactPage from './pages/contact/index';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';

function HomePage() {
    return (
        <>
            <Header />
            <main>
                <BannerCarousel />
                <HotProducts />
                <ProductGrid />
                <LatestBlog />
            </main>
            <Footer />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <div className="app">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/blog" element={<BlogPage />} />
                        <Route path="/post/:id" element={<BlogDetail />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/review/:productId" element={<ReviewPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                    </Routes>
                </div>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
