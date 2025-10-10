import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../utils/constants";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = ROUTES.HOME,
}) => {
  const { state } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && state.user.role !== requiredRole) {
    console.warn("[ProtectedRoute] Access denied:", {
      requiredRole,
      userRole: state.user.role,
      user: state.user,
      path: location.pathname,
      match: state.user.role === requiredRole
    });
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  // Log successful access in development
  if (import.meta.env.DEV) {
    console.log("[ProtectedRoute] Access granted:", {
      requiredRole,
      userRole: state.user.role,
      user: state.user,
      path: location.pathname
    });
  }

  return <>{children}</>;
};

export default ProtectedRoute;
