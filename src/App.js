import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import OrderForm from "./OrderForm";
import Settings from "./Settings";
import OrderList from "./OrderList";
import Login from "./Login";
import React from "react";

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);

  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;
  if (
    allowedRole === "solicitante" &&
    children.type === OrderForm &&
    (!settings.sector || !settings.nameOrStore)
  ) {
    return <Navigate to="/settings" />;
  }
  return children;
};

const App = () => {
  const user = useSelector((state) => state.user);
  const settings = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "CLEAR_USER" });
    navigate("/login");
  };

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex space-x-4 md:space-x-6">
          {user ? (
            <>
              {user.role === "solicitante" && (
                <>
                  <Link
                    to="/settings"
                    className="text-white hover:text-gray-300 font-medium"
                  >
                    Configurações
                  </Link>
                  {settings.sector && settings.nameOrStore && (
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
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRole="solicitante">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRole="solicitante">
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
          path="*"
          element={
            <Navigate
              to={user && user.role === "solicitante" ? "/settings" : "/login"}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
