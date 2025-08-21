import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const stored = useSelector((s) => s.settings);
  const user = useSelector((s) => s.user);
  const [sector, setSector] = useState(stored?.sector || "");
  const [nameOrStore, setNameOrStore] = useState(stored?.nameOrStore || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getSettings();
        dispatch({ type: "SET_SETTINGS", payload: s });
        setSector(s?.sector || "");
        setNameOrStore(s?.nameOrStore || "");
      } catch {}
    })();
  }, [dispatch]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      const saved = await api.saveSettings({ sector, nameOrStore });
      dispatch({ type: "SET_SETTINGS", payload: saved });
      localStorage.setItem("settings", JSON.stringify(saved));
      setMsg("Configurações salvas!");

      if (user?.role === "solicitante") navigate("/materiais/novo");
      if (user?.role === "solicitante_ti") navigate("/ti/novo");
    } catch (e1) {
      setErr(e1.message || "Erro ao salvar");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Configurações</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Setor</label>
          <input
            className="w-full border rounded p-2"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Nome / Loja</label>
          <input
            className="w-full border rounded p-2"
            value={nameOrStore}
            onChange={(e) => setNameOrStore(e.target.value)}
            required
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}

        <button className="bg-blue-600 text-white rounded px-4 py-2">
          Salvar
        </button>
      </form>
    </div>
  );
}
