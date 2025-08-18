import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ allow = [] }) {
  const { role } = useAuth();

  // Se não logado, manda para tela de login
  if (!role) return <Navigate to="/login" replace />;

  // Se logado mas sem papel permitido, manda para home (ou 403)
  if (allow.length > 0 && !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
