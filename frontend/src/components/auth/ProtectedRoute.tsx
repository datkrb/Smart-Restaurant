import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles = []
}) => {
    const { user, isAuthenticated } = useAuthStore();

    // Nếu chưa đăng nhập, chuyển về login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có yêu cầu role cụ thể, kiểm tra role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
