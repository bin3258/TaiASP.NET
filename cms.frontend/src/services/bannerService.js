import axiosClient from '../api/axiosClient';

const bannerService = {
    getAllBanners: () => {
        const url = '/Banners';
        return axiosClient.get(url);
    }
};

export default bannerService;
