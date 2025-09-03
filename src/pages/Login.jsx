// src/pages/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiLogin({
        email: email.trim(),
        password: password.trim(),
      }); // => { role }

      const user = { role: data.role };
      // Redux
      dispatch({ type: "SET_USER", payload: user });
      // LocalStorage
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch {}

      // Redireciona por papel
      switch (data.role) {
        case "responsavel":
        case "responsavel_ti":
          navigate("/dashboard", { replace: true });
          break;
        case "solicitante":
          navigate("/settings", { replace: true });
          break;
        case "solicitante_ti":
          navigate("/settings", { replace: true });
          break;
        default:
          navigate("/login", { replace: true });
      }
    } catch (err) {
      // O services/api já tenta parsear JSON e cai aqui com a msg correta
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            className="w-full border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            type="email"
            required
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            className="w-full border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

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
