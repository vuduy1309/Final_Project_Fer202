import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, hasRole, user, isLoading } = useAuth();
  const location = useLocation();
  const isAllowed = user && hasRole(allowedRoles);

  useEffect(() => {
    // Chỉ hiển thị thông báo lỗi khi đã load xong dữ liệu
    if (!isLoading) {
      if (!user) {
        toast.error("You must be logged in to access this page");
      } else if (!isAllowed) {
        toast.error("You do not have permission to access this page");
      }
    }
  }, [isLoading, user, isAllowed]);

  // Hiển thị loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Sau khi load xong, kiểm tra xác thực
  if (!isAuthenticated) {
    // Redirect to login page but save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Sau khi load xong, kiểm tra phân quyền
  if (!isAllowed) {
    // Redirect to home page
    return <Navigate to="/" replace />;
  }

  // Nếu đã xác thực và có quyền truy cập, hiển thị nội dung
  return children ? <>{children}</> : <Outlet />;
}
