import React from 'react';

const LoadingOrEmpty = ({ loading, isEmpty, message }) => {
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="text-center py-5">
                <i className="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
                <p className="text-muted">{message || 'Không có sản phẩm nào.'}</p>
            </div>
        );
    }

    return null;
};

export default LoadingOrEmpty;
