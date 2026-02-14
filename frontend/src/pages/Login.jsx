// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // 清除之前的错误
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }
        const result = await onLogin(username, password); // 调用从 Context 传来的 onLogin
        if (!result.success) {
            console.log('Login failed:', result.message);
            setError('登录失败，请重试');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="brand-mark">PALU CUP</div>
                <h1>管理平台登录</h1>
                <input
                    type="text"
                    placeholder="用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="login-error">{error}</p>}
                <button type="submit">登 录</button>
            </form>
        </div>
    );
}
