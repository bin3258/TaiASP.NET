import axiosClient from '../api/axiosClient';

const customersService = {
    getProfile: (customerId) => {
        return axiosClient.get(`/Customers/Profile/${customerId}`);
    },

    updateProfile: (customerId, data) => {
        return axiosClient.put(`/Customers/Profile/${customerId}`, data);
    },

    changePassword: (customerId, data) => {
        return axiosClient.put(`/Customers/ChangePassword/${customerId}`, data);
    },

    deleteAccount: (customerId) => {
        return axiosClient.delete(`/Customers/DeleteAccount/${customerId}`);
    },

    getOrders: (customerId) => {
        return axiosClient.get(`/Customers/Orders/${customerId}`);
    },

    getOrderDetail: (orderId) => {
        return axiosClient.get(`/Customers/OrderDetail/${orderId}`);
    }
};

export default customersService;
