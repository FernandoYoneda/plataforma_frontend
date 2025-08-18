import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem("role") || null;
    } catch (e) {
      console.warn("localStorage indisponível:", e);
      return null;
    }
  });

  useEffect(() => {
    try {
      if (role) {
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("role");
      }
    } catch (e) {
      console.warn("Falha ao persistir role:", e);
    }
  }, [role]);

  const login = async ({ email, password }) => {
    const res = await fetch(`/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Falha no login");
    }

    const data = await res.json();
    setRole(data.role);
    return data;
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
