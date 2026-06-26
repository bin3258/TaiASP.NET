import React, { useState, useEffect } from 'react';
import categoryProductService from '../../services/categoryProductService';

const CategoryProductList = () => {
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);

                const data = await categoryProductService.getAllCategoryProducts();

                console.log("Danh sách danh mục:", data);
                console.log("Là mảng:", Array.isArray(data));

                if (Array.isArray(data)) {
                    setCategoryProducts(data);
                } else {
                    setCategoryProducts([]);
                    console.error("Dữ liệu trả về không phải mảng:", data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh mục sản phẩm:", error);
                setCategoryProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, []);

    if (loading) {
        return (
            <div className="text-center my-4">
                Đang tải danh mục sản phẩm...
            </div>
        );
    }

    return (
        <div className="card shadow-sm border-0 rounded-lg">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4">
                <h5
                    className="card-title text-uppercase font-weight-bold text-dark d-flex align-items-center mb-0"
                    style={{
                        letterSpacing: "0.5px",
                        fontSize: "1.1rem"
                    }}
                >
                    <i
                        className="fa-solid fa-cubes text-primary mr-2"
                        style={{ fontSize: "1.3rem" }}
                    ></i>
                    Danh mục SP
                </h5>
            </div>

            <div className="card-body p-0">
                <div className="list-group list-group-flush">
                    {categoryProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted">
                            Không có danh mục nào.
                        </div>
                    ) : (
                        categoryProducts.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3"
                                style={{
                                    fontSize: "0.95rem",
                                    color: "#495057"
                                }}
                            >
                                {item.imageUrl ? <img src={`https://localhost:7068/images/${item.imageUrl}`} alt="" width="24" height="24" style={{ objectFit: 'cover', borderRadius: 4, marginRight: 8 }} /> : <i className="fa-solid fa-tag" style={{ marginRight: 8 }}></i>}
                                <span>{item.name}</span>

                                <i
                                    className="fa-solid fa-chevron-right text-muted"
                                    style={{
                                        fontSize: "0.8rem",
                                        opacity: 0.5
                                    }}
                                ></i>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryProductList;