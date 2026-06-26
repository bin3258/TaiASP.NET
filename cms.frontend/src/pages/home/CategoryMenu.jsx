import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoryProductService from '../../services/categoryProductService';

const CategoryMenu = ({ selectedCategory: externalSelected, onCategoryChange: externalOnChange }) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [internalActiveId, setInternalActiveId] = useState(null);
    const [loading, setLoading] = useState(true);

    const isControlled = externalSelected !== undefined && externalOnChange !== undefined;
    const activeId = isControlled ? externalSelected : internalActiveId;

    const handleClick = (id) => {
        if (isControlled) {
            externalOnChange(id);
        } else {
            setInternalActiveId(id);
            const params = id ? `?category=${id}` : '';
            navigate(`/shop${params}`);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await categoryProductService.getAllCategoryProducts();
                if (Array.isArray(data)) {
                    setCategories(data);
                }
            } catch (error) {
                console.error("Lỗi tải danh mục:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section className="category-menu">
            <div className="container">
                <div className="category-menu__wrapper">
                    <button className={`category-menu__item ${activeId === null ? 'active' : ''}`} onClick={() => handleClick(null)}>
                        <i className="fa-solid fa-th-large"></i>
                        <span>Tất cả</span>
                    </button>
                    {!loading && categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-menu__item ${activeId === cat.id ? 'active' : ''}`}
                            onClick={() => handleClick(cat.id)}
                        >
                            {cat.imageUrl ? <img src={`https://localhost:7068/images/${cat.imageUrl}`} alt="" className="category-menu__icon" /> : <i className="fa-solid fa-tag"></i>}
                            <span>{cat.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryMenu;
