import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('nutri_user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('nutri_user'); }
        }
        setInitialized(true);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('nutri_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('nutri_user');
    };

    const updateUser = (partial) => {
        const updated = { ...user, ...partial };
        setUser(updated);
        localStorage.setItem('nutri_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, initialized }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
