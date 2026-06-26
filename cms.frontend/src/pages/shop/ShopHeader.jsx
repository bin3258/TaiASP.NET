import React from 'react';

const sortOptions = [
    {
        value: '',
        label: 'Mới nhất',
        title: 'Ưu tiên sản phẩm mới nhất',
        icon: 'fa-solid fa-clock-rotate-left'
    },
    {
        value: 'asc',
        label: 'Thấp → Cao',
        title: 'Sắp xếp giá từ thấp đến cao',
        icon: 'fa-solid fa-arrow-up-short-wide'
    },
    {
        value: 'desc',
        label: 'Cao → Thấp',
        title: 'Sắp xếp giá từ cao đến thấp',
        icon: 'fa-solid fa-arrow-down-short-wide'
    }
];

const ShopHeader = ({
    totalProducts,
    selectedCategory,
    categories,
    searchQuery,
    sortOrder,
    onSearchChange,
    onSearchClear,
    onSortChange
}) => {
    const categoryName = selectedCategory
        ? categories?.find(c => c.id === selectedCategory)?.name
        : null;
    const activeSort = sortOptions.find(option => option.value === sortOrder) || sortOptions[0];

    return (
        <div className="shop-header">
            <div className="shop-header__info">
                <h2 className="shop-header__title">
                    {categoryName ? `Danh mục: ${categoryName}` : 'Tất cả sản phẩm'}
                </h2>
                <p className="shop-header__count">{totalProducts} sản phẩm</p>
            </div>
            <div className="shop-header__sort">
                <form className="shop-header__search" role="search" onSubmit={e => e.preventDefault()}>
                    <span className="shop-header__search-icon" aria-hidden="true">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </span>
                    <input
                        type="text"
                        className="shop-header__search-input"
                        placeholder="Tìm sản phẩm theo tên..."
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        aria-label="Tìm sản phẩm theo tên"
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="shop-header__search-clear"
                            onClick={onSearchClear}
                            aria-label="Xóa tìm kiếm"
                            title="Xóa tìm kiếm"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}
                </form>

                <div className="shop-header__sort-copy">
                    <span className="shop-header__sort-label">Sắp xếp</span>
                    <span className="shop-header__sort-hint">
                        Đang chọn: {activeSort.label}
                    </span>
                </div>

                <div className="shop-header__sort-options" role="group" aria-label="Chọn kiểu sắp xếp">
                    {sortOptions.map(option => {
                        const isActive = sortOrder === option.value;

                        return (
                            <button
                                key={option.value || 'newest'}
                                type="button"
                                className={`shop-header__sort-option${isActive ? ' is-active' : ''}`}
                                onClick={() => onSortChange(option.value)}
                                aria-pressed={isActive}
                                title={option.title}
                            >
                                <span className="shop-header__sort-option-icon" aria-hidden="true">
                                    <i className={option.icon}></i>
                                </span>
                                <span className="shop-header__sort-option-text">
                                    <span className="shop-header__sort-option-title">{option.label}</span>
                                </span>
                                {isActive && (
                                    <i className="fa-solid fa-check shop-header__sort-option-check" aria-hidden="true"></i>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ShopHeader;
