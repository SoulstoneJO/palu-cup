import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-brand">
        {location.pathname !== "/" && (
          <button
            className="nav-btn"
            onClick={() => navigate("/")}
            style={{ marginRight: "16px", fontSize: "1.2rem", lineHeight: 1, padding: "4px 8px" }}
            title="返回主页"
          >
            ←
          </button>
        )}
        <div className="brand-mark">PALU CUP</div>
        <div className="brand-text">
          <span className="brand-sub">管理后台</span>
          <h1>帕鲁杯管理中心</h1>
        </div>
      </div>

      <div className="app-header-actions">
        {user?.role && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginRight: "16px",
              padding: "6px 14px",
              background: user.role === "admin" 
                ? "rgba(16, 185, 129, 0.1)" 
                : "rgba(99, 102, 241, 0.1)",
              border: `1px solid ${user.role === "admin" ? "rgba(52, 211, 153, 0.3)" : "rgba(129, 140, 248, 0.3)"}`,
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "600",
              color: user.role === "admin" ? "#34d399" : "#818cf8",
              letterSpacing: "0.05em",
            }}
          >
            <span 
              style={{ 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                backgroundColor: "currentColor",
                boxShadow: `0 0 6px ${user.role === "admin" ? "rgba(52, 211, 153, 0.6)" : "rgba(129, 140, 248, 0.6)"}`
              }} 
            />
            {user.role === "admin" ? "操作员" : "观众"}
          </span>
        )}
        <button
          className="nav-btn"
          onClick={logout}
        >
          退出登录
        </button>
      </div>
    </header>
  );
}