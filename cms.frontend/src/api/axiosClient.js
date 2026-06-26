import axios from 'axios';

// Khởi tạo một thực thể axios với cấu hình base chung
const axiosClient = axios.create({
    baseURL: 'https://localhost:7068/api', // Đổi lại đúng cổng Port Backend của máy các em
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Thời gian tối đa chờ phản hồi từ server (10 giây)
});

// Tự động đăng xuất nếu tài khoản bị admin xóa
axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const message = (data && data.message) || '';

            // Admin đã xóa tài khoản → đăng xuất + thông báo
            if (status === 404 && message.includes('khách hàng')) {
                localStorage.removeItem('nutri_user');
                sessionStorage.setItem('nutri_account_deleted', 'true');
                window.location.href = '/login';
                return;
            }
        }

        console.error('Lỗi kết nối API:', error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;
