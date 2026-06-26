import axiosClient from '../api/axiosClient';

const orderService = {
    getCheckoutInfo: (customerId) => {
        return axiosClient.get(`/OrderDetail/checkout-info/${customerId}`);
    },

    updateCustomerInfo: (customerId, data) => {
        return axiosClient.put(`/OrderDetail/customer-info/${customerId}`, data);
    },

    checkout: (customerId, data) => {
        return axiosClient.post(`/OrderDetail/checkout/${customerId}`, data);
    }
};

export default orderService;
