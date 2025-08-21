import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

export default function ProtectedRoute({
  children,
  allowedRole,
  requireSettings = false,
}) {
  const { user, settings } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole)
    return <Navigate to="/login" replace />;
  if (requireSettings && (!settings?.sector || !settings?.nameOrStore)) {
    return <Navigate to="/settings" replace />;
  }
  return children;
}
