import axiosClient from '../api/axiosClient';

const cartService = {
    addToCart: (data) => {
        return axiosClient.post('/Carts/Add', data);
    },

    getCart: (customerId) => {
        return axiosClient.get(`/Carts/${customerId}`);
    },

    updateQuantity: (cartId, quantity) => {
        return axiosClient.put('/Carts/Update', null, { params: { cartId, quantity } });
    },

    removeItem: (cartId) => {
        return axiosClient.delete(`/Carts/${cartId}`);
    },

    clearCart: (customerId) => {
        return axiosClient.delete(`/Carts/Clear/${customerId}`);
    }
};

export default cartService;
