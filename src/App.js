// src/App.js
import React, { useEffect } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import OrderForm from "./OrderForm";
import Settings from "./Settings";
import OrderList from "./OrderList";
import Login from "./Login";
import TiHelpForm from "./TiHelpForm";
import TiTicketList from "./TiTicketList";

const ProtectedRoute = ({ children, allowedRole, requireSettings = false }) => {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);

  // Bloqueia acesso se não logado
  if (!user) return <Navigate to="/login" replace />;

  // Bloqueia se o papel não bate
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // Exige configurações preenchidas quando necessário
  if (requireSettings && (!settings?.sector || !settings?.nameOrStore)) {
    return <Navigate to="/settings" replace />;
  }

  return children;
};

const App = () => {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reidrata user e settings do localStorage ao montar
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        dispatch({ type: "SET_USER", payload: savedUser });
      }
    } catch (e) {
      console.warn("Não foi possível ler user do localStorage:", e);
    }

    try {
      const savedSettings = JSON.parse(localStorage.getItem("settings"));
      if (savedSettings) {
        dispatch({ type: "SET_SETTINGS", payload: savedSettings });
      }
    } catch (e) {
      console.warn("Não foi possível ler settings do localStorage:", e);
    }
  }, [dispatch]);

  const handleLogout = () => {
    dispatch({ type: "CLEAR_USER" });
    try {
      localStorage.removeItem("user");
      // Caso queira limpar também as configs locais:
      // localStorage.removeItem("settings");
      // dispatch({ type: "CLEAR_SETTINGS" });
    } catch (e) {
      console.warn("Não foi possível limpar localStorage:", e);
    }
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
          {user ? (
            <>
              {/* Materiais */}
              {user.role === "solicitante" && (
                <>
                  <Link
                    to="/settings"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Configurações
                  </Link>
                  {settings?.sector && settings?.nameOrStore && (
                    <Link
                      to="/"
                      className="text-white hover:text-gray-300 font-medium"
                    >
                      Novo Pedido
                    </Link>
                  )}
                </>
              )}

              {user.role === "responsavel" && (
                <Link
                  to="/orders"
                  className="text-white hover:text-gray-300 font-medium"
                >
                  Lista de Pedidos
                </Link>
              )}

              {/* TI */}
              {user.role === "solicitante_ti" && (
                <>
                  <Link
                    to="/settings"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Configurações
                  </Link>
                  {settings?.sector && settings?.nameOrStore && (
                    <Link
                      to="/ti/help"
                      className="text-white hover:text-gray-300 font-medium"
                    >
                      Chamado de TI
                    </Link>
                  )}
                </>
              )}

              {user.role === "responsavel_ti" && (
                <Link
                  to="/ti/chamados"
                  className="text-white hover:text-gray-300 font-medium"
                >
                  Lista de Chamados de TI
                </Link>
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

        {/* Materiais */}
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

        {/* Fallback por papel */}
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
};

export default App;
