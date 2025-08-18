import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TiTicketList() {
  const dispatch = useDispatch();
  const tickets = useSelector((state) => state.tickets);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/ti/tickets`);
        if (!res.ok) throw new Error("Falha ao listar chamados de TI");
        const data = await res.json();
        if (!cancelled) {
          dispatch({ type: "SET_TICKETS", payload: data });
        }
      } catch (e) {
        console.warn("Erro listando chamados de TI:", e);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Lista de Chamados de TI</h1>

      <div className="space-y-3">
        {tickets.length === 0 && (
          <div className="rounded border p-4 bg-white">
            Nenhum chamado até o momento.
          </div>
        )}

        {tickets.map((t) => (
          <div key={t.id} className="rounded border p-4 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h2 className="font-semibold">{t.title}</h2>
                <p className="text-sm text-gray-700 mt-1">{t.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Setor: <span className="font-medium">{t.sector || "—"}</span>{" "}
                  • Nome/Loja:{" "}
                  <span className="font-medium">{t.nameOrStore || "—"}</span>
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <div>
                  Status: <span className="font-medium">{t.status}</span>
                </div>
                <div className="mt-1">
                  Criado em: {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
