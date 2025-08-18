import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function TiHelpForm() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const user = useSelector((state) => state.user);

  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (!form.title.trim() || !form.description.trim()) {
      setError("Informe o título e a descrição do chamado.");
      return;
    }
    if (!settings?.sector?.trim() || !settings?.nameOrStore?.trim()) {
      setError(
        "Preencha Setor e Nome/Loja nas Configurações antes de abrir chamado."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        // ✅ Identificação de quem abriu
        sector: settings.sector.trim(),
        nameOrStore: settings.nameOrStore.trim(),
        createdBy: user?.role || "solicitante_ti",
        createdAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/ti/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Falha ao abrir chamado");
      const data = await res.json();

      dispatch({ type: "ADD_TICKET", payload: data });
      setOk(true);
      setForm({ title: "", description: "" });
    } catch (err) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Cabeçalho com identificação do solicitante de TI */}
      <div className="rounded-xl border p-4 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold">Chamado de TI</h1>
            <p className="text-sm text-gray-600">
              Você está logado como{" "}
              <span className="font-medium">{user?.role || "—"}</span>
            </p>
          </div>
          <div className="text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border px-3 py-1">
                <span className="mr-1 font-medium">Setor:</span>
                {settings?.sector || "—"}
              </span>
              <span className="inline-flex items-center rounded-full border px-3 py-1">
                <span className="mr-1 font-medium">Nome/Loja:</span>
                {settings?.nameOrStore || "—"}
              </span>
            </div>
            <div className="mt-2 text-right">
              <Link
                to="/settings"
                className="text-blue-600 hover:underline"
                title="Alterar configurações"
              >
                Alterar configurações
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário do chamado de TI */}
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-xl border p-4 bg-white shadow-sm"
      >
        <div>
          <label className="block text-sm mb-1">Título do chamado</label>
          <input
            className="w-full border rounded p-2"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Ex.: Computador não liga"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descrição</label>
          <textarea
            className="w-full border rounded p-2"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={5}
            placeholder="Explique o problema com detalhes…"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ok && (
          <p className="text-green-600 text-sm">Chamado aberto com sucesso!</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Enviando..." : "Abrir chamado"}
        </button>
      </form>
    </div>
  );
}
