// src/pages/Settings.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/** setores fixos (você pode mover para um arquivo constants) */
const SECTORS = [
  "ESC","SMA","COS","IGU","VOT","ARA","MAI","SAP","AST","CAR","ASC","COM",
  "CID","CPK","TAU","TZN","EDE","VD","ERS","ERN","FINANCEIRO","RH","TI","COMERCIAL","LOGISTICA","MARKETING",
];

export default function Settings() {
  const current = useSelector((s) => s.settings);
  const [sector, setSector] = useState(current?.sector || "");
  const [nameOrStore, setNameOrStore] = useState(current?.nameOrStore || "");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function save(e) {
    e.preventDefault();
    setSaving(true);

    try {
      // chama o backend só para validar e padronizar
      const res = await fetch(`/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, nameOrStore }),
      });

      const text = await res.text();
      if (!res.ok) {
        let msg = "Falha ao salvar";
        try { msg = JSON.parse(text).error || msg; } catch {}
        throw new Error(msg);
      }

      const data = text ? JSON.parse(text) : { sector, nameOrStore };

      dispatch({ type: "SET_SETTINGS", payload: data });
      try { localStorage.setItem("settings", JSON.stringify(data)); } catch {}

      // redireciona conforme o papel
      const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
      if (role === "solicitante") navigate("/", { replace: true });
      else if (role === "solicitante_ti") navigate("/ti/help", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      alert(err.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Configurações</h1>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Setor</label>
          <select
            className="w-full border rounded p-2"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
          >
            <option value="">Selecione…</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
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

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
