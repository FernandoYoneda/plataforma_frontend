// src/App.jsx
import React, { useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// telas existentes
import OrderForm from "./features/materials/OrderForm";
import OrderList from "./features/materials/OrderList";
import TiHelpForm from "./features/ti/TiHelpForm";
import TiTicketList from "./features/ti/TiTicketList";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import DashboardResponsavel from "./pages/DashboardResponsavel";

// NOVAS telas para o solicitante
import MyOrders from "./features/materials/MyOrders";
import MyTickets from "./features/ti/MyTickets";

const ProtectedRoute = ({ children, allowedRole, requireSettings = false }) => {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole)
    return <Navigate to="/login" replace />;

  if (requireSettings && (!settings?.sector || !settings?.nameOrStore)) {
    return <Navigate to="/settings" replace />;
  }
  return children;
};

export default function App() {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) dispatch({ type: "SET_USER", payload: savedUser });
    } catch {}
    try {
      const savedSettings = JSON.parse(localStorage.getItem("settings"));
      if (savedSettings)
        dispatch({ type: "SET_SETTINGS", payload: savedSettings });
    } catch {}
  }, [dispatch]);

  const handleLogout = () => {
    dispatch({ type: "CLEAR_USER" });
    try {
      localStorage.removeItem("user");
    } catch {}
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {user ? (
            <>
              {/* Materiais - Solicitante */}
              {user.role === "solicitante" && (
                <>
                  <Link
                    to="/settings"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Configurações
                  </Link>
                  {settings?.sector && settings?.nameOrStore && (
                    <>
                      <Link
                        to="/"
                        className="text-white hover:text-gray-300 font-medium"
                      >
                        Novo Pedido
                      </Link>
                      <Link
                        to="/meus-pedidos"
                        className="text-white hover:text-gray-300 font-medium"
                      >
                        Meus Pedidos
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Materiais - Responsável */}
              {user.role === "responsavel" && (
                <>
                  <Link
                    to="/orders"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Lista de Pedidos
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Visão Geral
                  </Link>
                </>
              )}

              {/* TI - Solicitante */}
              {user.role === "solicitante_ti" && (
                <>
                  <Link
                    to="/settings"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Configurações
                  </Link>
                  {settings?.sector && settings?.nameOrStore && (
                    <>
                      <Link
                        to="/ti/help"
                        className="text-white hover:text-gray-300 font-medium"
                      >
                        Chamado de TI
                      </Link>
                      <Link
                        to="/meus-chamados"
                        className="text-white hover:text-gray-300 font-medium"
                      >
                        Meus Chamados
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* TI - Responsável */}
              {user.role === "responsavel_ti" && (
                <>
                  <Link
                    to="/ti/chamados"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Lista de Chamados de TI
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Visão Geral
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-white hover:text-gray-300 font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Configurações */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRole={
                user?.role?.includes("ti") ? user.role : "solicitante"
              }
            >
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Materiais */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRole="solicitante" requireSettings>
              <OrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRole="responsavel">
              <OrderList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meus-pedidos"
          element={
            <ProtectedRoute allowedRole="solicitante" requireSettings>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        {/* TI */}
        <Route
          path="/ti/help"
          element={
            <ProtectedRoute allowedRole="solicitante_ti" requireSettings>
              <TiHelpForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ti/chamados"
          element={
            <ProtectedRoute allowedRole="responsavel_ti">
              <TiTicketList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meus-chamados"
          element={
            <ProtectedRoute allowedRole="solicitante_ti" requireSettings>
              <MyTickets />
            </ProtectedRoute>
          }
        />

        {/* Dashboard (ambos responsáveis) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardResponsavel />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? user.role === "solicitante"
                    ? "/settings"
                    : user.role === "responsavel"
                    ? "/orders"
                    : user.role === "solicitante_ti"
                    ? "/settings"
                    : user.role === "responsavel_ti"
                    ? "/ti/chamados"
                    : "/login"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </div>
  );
}
