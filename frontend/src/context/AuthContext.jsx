import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api'; // 从 api.js 导入

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // 辅助函数：解析 JWT Token 获取用户信息 (Payload)
    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    // 初始化或 Token 变化时，解析用户并检查过期
    useEffect(() => {
        if (token) {
            const decoded = parseJwt(token);
            // 简单检查过期时间 (exp 是秒数)
            if (decoded && decoded.exp * 1000 > Date.now()) {
                setUser(decoded);
                localStorage.setItem('token', token);
            } else {
                logout(); // 过期则登出
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = async (account, password) => {
        try {
            const data = await apiLogin(account, password); // 调用 api.js 中的 login
            if (data.success) {
                setToken(localStorage.getItem('token')); // 成功后从 localStorage 更新 token，触发 useEffect
                return { success: true };
            } else {
                return { success: false, message: data.message || '登录失败' };
            }
        } catch (error) {
            console.error('Login error:', error.message);
            return { success: false, message: error.message || '网络连接错误' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 自定义 Hook，方便组件调用
export const useAuth = () => useContext(AuthContext);