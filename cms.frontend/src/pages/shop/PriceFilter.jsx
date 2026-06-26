import React, { useCallback, useRef } from 'react';

const MIN = 0;
const MAX = 5000000;
const STEP = 10000;

const PriceFilter = ({ minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }) => {
    const trackRef = useRef(null);

    const minVal = minPrice === '' ? MIN : Number(minPrice);
    const maxVal = maxPrice === '' ? MAX : Number(maxPrice);

    const leftPct = (minVal / MAX) * 100;
    const rightPct = 100 - (maxVal / MAX) * 100;

    const handleMinChange = useCallback((e) => {
        const v = Number(e.target.value);
        const currentMax = maxPrice === '' ? MAX : Number(maxPrice);
        if (v > currentMax) return;
        onMinPriceChange(String(v));
    }, [maxPrice, onMinPriceChange]);

    const handleMaxChange = useCallback((e) => {
        const v = Number(e.target.value);
        const currentMin = minPrice === '' ? MIN : Number(minPrice);
        if (v < currentMin) return;
        onMaxPriceChange(String(v));
    }, [minPrice, onMaxPriceChange]);

    return (
        <div className="price-filter">
            <h4 className="price-filter__title">Lọc theo giá</h4>

            <div className="price-filter__display">
                <span className="price-filter__display-min">
                    {minPrice === '' ? '0 ₫' : Number(minPrice).toLocaleString('vi-VN') + ' ₫'}
                </span>
                <span className="price-filter__display-max">
                    {maxPrice === '' ? Number(MAX).toLocaleString('vi-VN') + ' ₫' : Number(maxPrice).toLocaleString('vi-VN') + ' ₫'}
                </span>
            </div>

            <div className="price-filter__slider" ref={trackRef}>
                <div className="price-filter__track"></div>
                <div
                    className="price-filter__range"
                    style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
                ></div>
                <input
                    type="range"
                    className="price-filter__thumb price-filter__thumb--min"
                    min={MIN}
                    max={MAX}
                    step={STEP}
                    value={minVal}
                    onChange={handleMinChange}
                />
                <input
                    type="range"
                    className="price-filter__thumb price-filter__thumb--max"
                    min={MIN}
                    max={MAX}
                    step={STEP}
                    value={maxVal}
                    onChange={handleMaxChange}
                />
            </div>

            {(minPrice !== '' || maxPrice !== '') && (
                <button
                    className="price-filter__clear"
                    onClick={() => { onMinPriceChange(''); onMaxPriceChange(''); }}
                >
                    <i className="fa-solid fa-xmark"></i> Xoá bộ lọc
                </button>
            )}
        </div>
    );
};

export default PriceFilter;
