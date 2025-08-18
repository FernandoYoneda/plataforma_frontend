// src/TiHelpForm.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "./api";

export default function TiHelpForm() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.settings);
  const user = useSelector((s) => s.user);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!title.trim() || !description.trim()) {
      setMsg("Informe título e descrição do chamado.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        sector: settings?.sector || null,
        nameOrStore: settings?.nameOrStore || null,
        createdBy: user?.email || user?.role || null,
      };
      const created = await api.createTiTicket(payload);
      dispatch({ type: "ADD_TI_TICKET", payload: created });

      setTitle("");
      setDescription("");
      setMsg("Chamado aberto com sucesso!");
    } catch (err) {
      setMsg(err.message || "Erro ao abrir chamado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <div className="text-sm text-gray-700">
          <strong>Usuário:</strong> {settings?.nameOrStore || "-"} &nbsp;|&nbsp;{" "}
          <strong>Setor:</strong> {settings?.sector || "-"}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Abrir Chamado de TI</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Computador não liga"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea
            className="w-full border rounded p-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o problema..."
            required
          />
        </div>

        {msg && <div className="text-sm">{msg}</div>}

        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Abrir Chamado"}
        </button>
      </form>
    </div>
  );
}
