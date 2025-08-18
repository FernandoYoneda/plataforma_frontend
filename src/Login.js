// src/Login.js
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { api } from "./api"; // usa REACT_APP_API em produção

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login({
        email: email.trim(),
        password: password.trim(),
      }); // espera { role: "..." }

      // guarda no redux
      dispatch({ type: "SET_USER", payload: { email, role: data.role } });

      // persiste no localStorage
      try {
        localStorage.setItem(
          "user",
          JSON.stringify({ email, role: data.role })
        );
      } catch {
        /* ignore */
      }

      // redireciona por papel
      switch (data.role) {
        case "responsavel":
          navigate("/orders", { replace: true });
          break;
        case "solicitante":
          navigate("/settings", { replace: true });
          break;
        case "responsavel_ti":
          navigate("/ti/chamados", { replace: true });
          break;
        case "solicitante_ti":
          navigate("/ti/help", { replace: true });
          break;
        default:
          navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-16">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow rounded p-6 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <label className="block text-sm mb-1">E-mail</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@exemplo.com"
          required
          autoComplete="username"
        />

        <label className="block text-sm mb-1">Senha</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
          autoComplete="current-password"
        />

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
