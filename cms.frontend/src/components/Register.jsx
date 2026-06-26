import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', fullName: '', phone: '', address: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (form.phone && !/^\d{10}$/.test(form.phone)) {
            setError('Số điện thoại phải có 10 chữ số');
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...data } = form;
            await authService.register(data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">NUTRI<span className="auth-logo-dot">.</span></Link>
                    <h1>Đăng ký</h1>
                    <p>Tạo tài khoản để mua sắm dễ dàng hơn</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" required />
                    </div>

                    <div className="auth-field">
                        <label>Họ tên</label>
                        <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Nguyễn Văn A" required />
                    </div>

                    <div className="auth-field">
                        <label>Số điện thoại</label>
                        <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="0123456789" />
                    </div>

                    <div className="auth-field">
                        <label>Địa chỉ</label>
                        <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Số nhà, đường, phường, quận, TP" />
                    </div>

                    <div className="auth-field">
                        <label>Mật khẩu</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>

                    <div className="auth-field">
                        <label>Xác nhận mật khẩu</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm mr-2" role="status"></span> : null}
                        Đăng ký
                    </button>
                </form>

                <p className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
