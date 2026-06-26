import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">NUTRI<span className="auth-logo-dot">.</span></Link>
                    <h1>Quên mật khẩu</h1>
                    <p>Nhập email để nhận mật khẩu mới</p>
                </div>

                {sent ? (
                    <div className="auth-success">
                        <div className="auth-success__icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </div>
                        <h3>Đã gửi!</h3>
                        <p>Nếu email tồn tại, mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.</p>
                        <Link to="/login" className="auth-btn" style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}>Quay lại đăng nhập</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-field">
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading || !email.trim()}>
                            {loading ? <span className="spinner-border spinner-border-sm mr-2" role="status"></span> : null}
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/login">Quay lại đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
