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

    const emailNorm = email.trim();
    const passNorm = password.trim();

    try {
      const res = await fetch(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNorm, password: passNorm }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Credenciais inválidas");
      }

      const data = await res.json(); // { role }
      dispatch({ type: "SET_USER", payload: { role: data.role } });

      try {
        localStorage.setItem("user", JSON.stringify({ role: data.role }));
      } catch (e2) {
        console.warn("Não foi possível salvar user no localStorage:", e2);
      }

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
