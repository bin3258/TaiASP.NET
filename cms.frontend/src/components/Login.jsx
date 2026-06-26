import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('nutri_account_deleted') === 'true') {
            sessionStorage.removeItem('nutri_account_deleted');
            setDeleted(true);
        }
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await authService.login({
                email: form.email.trim(),
                password: form.password
            });
            login(result);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">NUTRI<span className="auth-logo-dot">.</span></Link>
                    <h1>Đăng nhập</h1>
                    <p>Chào mừng bạn trở lại!</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {deleted && <div className="auth-error" style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffc107' }}>Tài khoản của bạn đã bị xóa bởi quản trị viên.</div>}
                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required />
                    </div>

                    <div className="auth-field">
                        <label>Mật khẩu</label>
                        <div className="auth-password-wrap">
                            <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                            <button type="button" className="auth-password-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                                {showPwd ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="auth-forgot">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm mr-2" role="status"></span> : null}
                        Đăng nhập
                    </button>
                </form>

                <p className="auth-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
