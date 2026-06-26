import React from 'react';

const ShopHeader = ({ totalProducts, selectedCategory, categories }) => {
    const categoryName = selectedCategory
        ? categories?.find(c => c.id === selectedCategory)?.name
        : null;

    return (
        <div className="shop-header">
            <div className="shop-header__info">
                <h2 className="shop-header__title">
                    {categoryName ? `Danh mục: ${categoryName}` : 'Tất cả sản phẩm'}
                </h2>
                <p className="shop-header__count">{totalProducts} sản phẩm</p>
            </div>
        </div>
    );
};

export default ShopHeader;
