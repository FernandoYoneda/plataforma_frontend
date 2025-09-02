// src/pages/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      // SEMPRE ler como texto primeiro
      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        // se não for JSON, data fica null
      }

      if (!res.ok) {
        throw new Error((data && data.error) || raw || "Credenciais inválidas");
      }
      if (!data || !data.role) {
        throw new Error("Resposta inválida do servidor");
      }

      const user = { role: data.role };
      dispatch({ type: "SET_USER", payload: user });
      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch {}

      switch (data.role) {
        case "responsavel":
        case "responsavel_ti":
          navigate("/dashboard", { replace: true });
          break;
        case "solicitante":
        case "solicitante_ti":
          navigate("/settings", { replace: true });
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
