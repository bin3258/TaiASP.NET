import axiosClient from '../api/axiosClient';

const productService = {
    getAllProducts: () => {
        const url = '/Products';
        return axiosClient.get(url);
    },

    getProductById: (id) => {
        const url = `/Products/${id}`;
        return axiosClient.get(url);
    },

    getProductsByCategory: (categoryId) => {
        const url = `/Products/category/${categoryId}`;
        return axiosClient.get(url);
    },

    getHotProducts: () => {
        const url = '/Products/hot';
        return axiosClient.get(url);
    },

    getNewProducts: () => {
        const url = '/Products/new';
        return axiosClient.get(url);
    },

    searchProducts: (params) => {
        const url = '/Products/search';
        return axiosClient.get(url, { params });
    },

    getRelatedProducts: (categoryId, excludeId) => {
        const url = `/Products/category/${categoryId}`;
        return axiosClient.get(url).then(data => {
            if (Array.isArray(data)) {
                return data.filter(p => p.id !== excludeId).slice(0, 4);
            }
            return [];
        });
    }
};

export default productService;
