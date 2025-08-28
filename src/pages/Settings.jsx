// src/pages/Settings.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Lista fixa de setores (como você pediu)
const SECTORS = [
  "ESC",
  "SMA",
  "COS",
  "IGU",
  "VOT",
  "ARA",
  "MAI",
  "SAP",
  "AST",
  "CAR",
  "ASC",
  "COM",
  "CID",
  "CPK",
  "TAU",
  "TZN",
  "EDE",
  "VD",
  "ERS",
  "ERN",
  "FINANCEIRO",
  "RH",
  "TI",
  "COMERCIAL",
  "LOGISTICA",
];

export default function Settings() {
  const current = useSelector((s) => s.settings);
  const [sector, setSector] = useState(current?.sector || "");
  const [nameOrStore, setNameOrStore] = useState(current?.nameOrStore || "");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      sector: String(sector || "").trim(),
      nameOrStore: String(nameOrStore || "").trim(),
    };

    try {
      const res = await fetch(`/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar configurações");

      const data = await res.json();
      dispatch({ type: "SET_SETTINGS", payload: data });

      try {
        localStorage.setItem("settings", JSON.stringify(data));
      } catch {
        /* ignore */
      }

      // Redireciona conforme o papel salvo no localStorage
      const role = JSON.parse(localStorage.getItem("user") || "{}")?.role;
      if (role === "solicitante") {
        navigate("/", { replace: true });
      } else if (role === "solicitante_ti") {
        navigate("/ti/help", { replace: true });
      }
    } catch (e2) {
      alert(e2.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Configurações</h1>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Setor</label>
          <select
            required
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full border rounded p-2 bg-white"
          >
            <option value="">Selecione o setor…</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Nome / Loja</label>
          <input
            required
            className="w-full border rounded p-2"
            value={nameOrStore}
            onChange={(e) => setNameOrStore(e.target.value)}
            placeholder="Seu nome ou loja"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60 hover:bg-blue-700"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
