import axiosClient from '../api/axiosClient';

const reviewService = {
    getByProduct: (productId) => {
        return axiosClient.get(`/Reviews/product/${productId}`);
    },

    create: (formData) => {
        return axiosClient.post('/Reviews', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    update: (id, formData) => {
        return axiosClient.put(`/Reviews/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    delete: (id, customerId) => {
        return axiosClient.delete(`/Reviews/${id}`, {
            params: { customerId }
        });
    }
};

export default reviewService;
