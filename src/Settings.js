// src/Settings.js
import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.user);
  const globalSettings = useSelector((s) => s.settings);

  const [sector, setSector] = useState(globalSettings?.sector || "");
  const [nameOrStore, setNameOrStore] = useState(
    globalSettings?.nameOrStore || ""
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getSettings();
        dispatch({ type: "SET_SETTINGS", payload: s });
        setSector(s?.sector || "");
        setNameOrStore(s?.nameOrStore || "");
        try {
          localStorage.setItem("settings", JSON.stringify(s));
        } catch {}
      } catch {
        // ignora: se ainda não existir, formulário inicia vazio
      }
    })();
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!sector.trim() || !nameOrStore.trim()) {
      setMsg("Preencha setor e nome.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        sector: sector.trim(),
        nameOrStore: nameOrStore.trim(),
      };
      const saved = await api.saveSettings(payload);

      dispatch({ type: "SET_SETTINGS", payload: saved });
      try {
        localStorage.setItem("settings", JSON.stringify(saved));
      } catch {}

      setMsg("Configurações salvas!");

      // redireciona de acordo com o papel
      if (user?.role === "solicitante") navigate("/", { replace: true });
      if (user?.role === "solicitante_ti")
        navigate("/ti/help", { replace: true });
    } catch (err) {
      setMsg(err.message || "Falha ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Setor</label>
          <input
            className="w-full border rounded p-2"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="Ex: Financeiro, Vendas, TI"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nome / Loja</label>
          <input
            className="w-full border rounded p-2"
            value={nameOrStore}
            onChange={(e) => setNameOrStore(e.target.value)}
            placeholder="Seu nome ou loja"
            required
          />
        </div>

        {msg && <div className="text-sm">{msg}</div>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
