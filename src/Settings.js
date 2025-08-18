import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const settings = useSelector((state) => state.settings);

  const [sector, setSector] = useState(settings?.sector || "");
  const [nameOrStore, setNameOrStore] = useState(settings?.nameOrStore || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Carrega settings do backend quando ainda não existem no Redux
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/settings`);
        if (!res.ok) throw new Error("Falha ao carregar configurações");
        const data = await res.json(); // { sector, nameOrStore }
        if (!cancelled) {
          dispatch({ type: "SET_SETTINGS", payload: data });
          setSector(data?.sector || "");
          setNameOrStore(data?.nameOrStore || "");
          try {
            localStorage.setItem("settings", JSON.stringify(data));
          } catch (e) {
            console.warn(
              "Não foi possível salvar settings no localStorage:",
              e
            );
          }
        }
      } catch (e) {
        console.warn("Erro buscando settings:", e);
      }
    }

    if (!settings?.sector || !settings?.nameOrStore) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [dispatch, settings?.sector, settings?.nameOrStore]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!sector.trim() || !nameOrStore.trim()) {
      setError("Preencha Setor e Nome/Loja.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: sector.trim(),
          nameOrStore: nameOrStore.trim(),
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar configurações");
      const data = await res.json();

      dispatch({ type: "SET_SETTINGS", payload: data });
      try {
        localStorage.setItem("settings", JSON.stringify(data));
      } catch (e2) {
        console.warn("Não foi possível salvar settings no localStorage:", e2);
      }

      // Após salvar com sucesso, vai para Novo Pedido
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
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
          <label className="block text-sm mb-1">Nome/Loja</label>
          <input
            className="w-full border rounded p-2"
            value={nameOrStore}
            onChange={(e) => setNameOrStore(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar e continuar"}
        </button>
      </form>
    </div>
  );
}
