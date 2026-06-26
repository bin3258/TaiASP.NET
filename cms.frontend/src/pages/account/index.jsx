import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import customersService from '../../services/customersService';

const AccountPage = () => {
    const { user, logout, updateUser, initialized } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({ fullName: '', phone: '', address: '' });
    const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (!initialized) return;

        if (!user?.customerId) {
            navigate('/login');
            return;
        }

        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await customersService.getProfile(user.customerId);
                setProfile({
                    fullName: data.fullName || '',
                    phone: data.phone || '',
                    address: data.address || ''
                });
            } catch (err) {
                setFieldErrors({ load: err.response?.data?.message || 'Không thể tải thông tin' });
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, navigate, initialized]);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
        if (profileError) setProfileError('');
    };

    const handlePasswordChange = (e) => {
        setPassword({ ...password, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
        if (passwordError) setPasswordError('');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setProfileError('');
        setFieldErrors({});

        if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
            setFieldErrors({ phone: 'Số điện thoại phải có 10 chữ số' });
            return;
        }

        setSaving(true);

        try {
            await customersService.updateProfile(user.customerId, profile);
            const fresh = await customersService.getProfile(user.customerId);
            updateUser({
                fullName: fresh.fullName,
                phone: fresh.phone,
                address: fresh.address
            });
            setMessage('Cập nhật thông tin thành công');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setPasswordError('');
        setFieldErrors({});

        if (!password.oldPassword) {
            setFieldErrors({ oldPassword: 'Vui lòng nhập mật khẩu cũ' });
            return;
        }

        if (!password.newPassword) {
            setFieldErrors({ newPassword: 'Vui lòng nhập mật khẩu mới' });
            return;
        }

        setSaving(true);

        try {
            await customersService.changePassword(user.customerId, password);
            logout();
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại';
            if (msg.includes('mật khẩu cũ') || msg.includes('Mật khẩu cũ')) {
                setFieldErrors({ oldPassword: msg });
            } else {
                setPasswordError(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setShowDeleteModal(false);
        setMessage('');
        setPasswordError('');
        setProfileError('');
        setFieldErrors({});
        setSaving(true);

        try {
            await customersService.deleteAccount(user.customerId);
            logout();
            navigate('/register');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Xóa tài khoản thất bại');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="account-page">
                    <div className="container">
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="account-page">
                <div className="container">
                    <h1 className="account-page__title">Tài khoản của tôi</h1>

                    {fieldErrors.load && <div className="account-page__error">{fieldErrors.load}</div>}
                    {message && <div className="account-page__success">{message}</div>}

                    <div className="account-page__layout">
                        <div className="account-page__section">
                            <h2 className="account-section__title">Thông tin cá nhân</h2>
                            {profileError && <div className="account-page__error">{profileError}</div>}
                            <form onSubmit={handleUpdateProfile}>
                                <div className="account-field">
                                    <label>Email</label>
                                    <input type="email" value={user?.email || ''} disabled />
                                </div>
                                <div className="account-field">
                                    <label>Họ tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={profile.fullName}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div className="account-field">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                        className={fieldErrors.phone ? 'input-error' : ''}
                                    />
                                    {fieldErrors.phone && <span className="account-field__error">{fieldErrors.phone}</span>}
                                </div>
                                <div className="account-field">
                                    <label>Địa chỉ</label>
                                    <textarea
                                        name="address"
                                        value={profile.address}
                                        onChange={handleProfileChange}
                                        rows="3"
                                    />
                                </div>
                                <button type="submit" className="account-btn account-btn--primary" disabled={saving}>
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </form>
                        </div>

                        <div className="account-page__section">
                            <h2 className="account-section__title">Đổi mật khẩu</h2>
                            {passwordError && <div className="account-page__error">{passwordError}</div>}
                            <form onSubmit={handleChangePassword}>
                                <div className="account-field">
                                    <label>Mật khẩu cũ</label>
                                    <div className="auth-password-wrap">
                                        <input
                                            type={showOldPwd ? 'text' : 'password'}
                                            name="oldPassword"
                                            value={password.oldPassword}
                                            onChange={handlePasswordChange}
                                            className={fieldErrors.oldPassword ? 'input-error' : ''}
                                            required
                                        />
                                        <button type="button" className="auth-password-toggle" onClick={() => setShowOldPwd(!showOldPwd)} tabIndex={-1}>
                                            {showOldPwd ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.oldPassword && <span className="account-field__error">{fieldErrors.oldPassword}</span>}
                                </div>
                                <div className="account-field">
                                    <label>Mật khẩu mới</label>
                                    <div className="auth-password-wrap">
                                        <input
                                            type={showNewPwd ? 'text' : 'password'}
                                            name="newPassword"
                                            value={password.newPassword}
                                            onChange={handlePasswordChange}
                                            className={fieldErrors.newPassword ? 'input-error' : ''}
                                            required
                                        />
                                        <button type="button" className="auth-password-toggle" onClick={() => setShowNewPwd(!showNewPwd)} tabIndex={-1}>
                                            {showNewPwd ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            )}
                                        </button>
                                    </div>
                                    {fieldErrors.newPassword && <span className="account-field__error">{fieldErrors.newPassword}</span>}
                                </div>
                                <button type="submit" className="account-btn account-btn--primary" disabled={saving}>
                                    {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                                </button>
                            </form>
                        </div>

                        <div className="account-page__section">
                            <h2 className="account-section__title account-section__title--danger">Khu vực nguy hiểm</h2>
                            <p className="account-page__danger-desc">
                                Khi xóa tài khoản, toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                            </p>
                            <button
                                className="account-btn account-btn--danger"
                                onClick={() => setShowDeleteModal(true)}
                                disabled={saving}
                            >
                                Xóa tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-box__title">Xác nhận xóa tài khoản</h3>
                        <p className="modal-box__desc">
                            Bạn có chắc chắn muốn xóa tài khoản?<br />
                            Hành động này <strong>không thể hoàn tác</strong>.
                        </p>
                        <div className="modal-box__actions">
                            <button
                                className="account-btn account-btn--danger"
                                onClick={handleDeleteAccount}
                            >
                                Xác nhận xóa
                            </button>
                            <button
                                className="account-btn account-btn--cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default AccountPage;
