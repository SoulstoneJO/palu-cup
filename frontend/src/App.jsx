import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";

/**
 * 路由组件
 */
const AppRoutes = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <Routes>
      {/* 登录页路由：如果已登录，重定向到首页 */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={login} />
        } 
      />
      
      {/* 受保护的主内容路由 */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

/**
 * App 组件：提供 AuthProvider 上下文
 */
export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppRoutes />
      </ModalProvider>
    </AuthProvider>
  );
}
