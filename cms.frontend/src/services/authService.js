import axiosClient from '../api/axiosClient';

const authService = {
    register: (data) => {
        return axiosClient.post('/Auth/CustomerRegister', data);
    },

    login: (data) => {
        return axiosClient.post('/Auth/CustomerLogin', data);
    },

    forgotPassword: (email) => {
        return axiosClient.post('/Auth/ForgotPassword', { email });
    }
};

export default authService;
