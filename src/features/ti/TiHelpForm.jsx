// src/features/ti/TiHelpForm.jsx (COMPLETO)
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createTicket } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function TiHelpForm() {
  const settings = useSelector((s) => s.settings);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // <-- descrição
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!settings?.sector || !settings?.nameOrStore) {
        throw new Error("Configure seu Setor e Nome/Loja em Configurações.");
      }

      await createTicket({
        sector: settings.sector,
        nameOrStore: settings.nameOrStore,
        title: title.trim(),
        description: description.trim(), // <-- envia
      });

      // Reset
      setTitle("");
      setDescription("");

      // Redireciona para "Meus Chamados" (se você criou essa rota)
      navigate("/ti/meus-chamados");
    } catch (e2) {
      setError(e2.message || "Erro ao abrir chamado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Abrir Chamado de TI</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Sem acesso ao e-mail"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o problema com detalhes…"
          />
        </div>

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60 hover:bg-blue-700"
        >
          {loading ? "Enviando..." : "Abrir Chamado"}
        </button>
      </form>
    </div>
  );
}
