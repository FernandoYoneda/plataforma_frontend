import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import NavBar from "./components/Layout/NavBar";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Materiais
import OrderForm from "./features/materials/OrderForm";
import MyOrders from "./features/materials/MyOrders";
import OrderList from "./features/materials/OrderList";

// TI
import TiHelpForm from "./features/ti/TiHelpForm";
import MyTiTickets from "./features/ti/MyTiTickets";
import TiTicketList from "./features/ti/TiTicketList";

// Auth
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  const user = useSelector((s) => s.user);
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
      <NavBar onLogout={handleLogout} />

      <Routes>
        <Route path="/login" element={<Login />} />

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
          path="/materiais/novo"
          element={
            <ProtectedRoute allowedRole="solicitante" requireSettings>
              <OrderForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materiais/meus"
          element={
            <ProtectedRoute allowedRole="solicitante" requireSettings>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materiais/lista"
          element={
            <ProtectedRoute allowedRole="responsavel">
              <OrderList />
            </ProtectedRoute>
          }
        />

        {/* TI */}
        <Route
          path="/ti/novo"
          element={
            <ProtectedRoute allowedRole="solicitante_ti" requireSettings>
              <TiHelpForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ti/meus"
          element={
            <ProtectedRoute allowedRole="solicitante_ti" requireSettings>
              <MyTiTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ti/lista"
          element={
            <ProtectedRoute allowedRole="responsavel_ti">
              <TiTicketList />
            </ProtectedRoute>
          }
        />

        {/* Home → fallback por papel */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                replace
                to={
                  user.role === "solicitante"
                    ? "/materiais/novo"
                    : user.role === "responsavel"
                    ? "/materiais/lista"
                    : user.role === "solicitante_ti"
                    ? "/ti/novo"
                    : user.role === "responsavel_ti"
                    ? "/ti/lista"
                    : "/login"
                }
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
