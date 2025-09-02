// src/features/ti/MyTickets.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../../services/api";

function StatusBadge({ status }) {
  const map = {
    aberto: "bg-gray-100 text-gray-800",
    em_andamento: "bg-amber-100 text-amber-800",
    finalizado: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {String(status || "").replace("_", " ")}
    </span>
  );
}

export default function MyTickets() {
  const settings = useSelector((s) => s.settings);
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!settings?.sector || !settings?.nameOrStore) {
      navigate("/settings", { replace: true });
    }
  }, [settings, navigate]);

  const load = async () => {
    if (!settings?.sector || !settings?.nameOrStore) return;
    setLoading(true);
    setError("");
    try {
      const params = {
        sector: settings.sector,
        nameOrStore: settings.nameOrStore,
      };
      if (status) params.status = status;
      if (q) params.q = q;

      const data = await getTickets(params);
      setList(data || []);
      setPage(1);
    } catch (e) {
      setError(e.message || "Erro ao carregar chamados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, settings?.sector, settings?.nameOrStore]);

  // paginação
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);
  const visible = list.slice(startIndex, endIndex);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meus Chamados (TI)</h1>
          <p className="text-sm text-gray-600">
            <strong>Usuário:</strong> {settings?.nameOrStore || "-"} &middot{" "}
            <strong>Setor:</strong> {settings?.sector || "-"}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3 grid md:grid-cols-3 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm md:col-span-2"
            placeholder="Buscar por título/descrição"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Carregando…</div>
      ) : (
        <>
          {/* header da paginação */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Exibindo{" "}
              <strong>
                {total === 0 ? 0 : startIndex + 1}–{endIndex}
              </strong>{" "}
              de <strong>{total}</strong> chamados
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span>Tamanho da página:</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={goFirst}
                  disabled={safePage === 1}
                >
                  «
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={goPrev}
                  disabled={safePage === 1}
                >
                  ‹
                </button>
                <span className="px-2">
                  Página <strong>{safePage}</strong> de{" "}
                  <strong>{totalPages}</strong>
                </span>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={goNext}
                  disabled={safePage === totalPages}
                >
                  ›
                </button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={goLast}
                  disabled={safePage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Feedback do responsável</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      Você ainda não tem chamados com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  visible.map((t) => (
                    <tr key={t.id} className="odd:bg-white even:bg-gray-50/60">
                      <td className="p-3 text-gray-700">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {t.title}
                      </td>
                      <td className="p-3 text-gray-700">
                        {t.description?.trim() || "-"}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-3 text-gray-700">
                        {t.response?.trim() || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
