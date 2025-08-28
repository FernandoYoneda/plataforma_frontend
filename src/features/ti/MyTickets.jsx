// src/features/ti/MyTickets.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTickets } from "../../services/api";

// --- helpers UI -------------------------------------------------------------
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

function LoadingRow({ colSpan = 1, label = "Carregando…" }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-6">
        <div className="flex items-center gap-3 text-gray-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
          {label}
        </div>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan = 1, label = "Nenhum registro encontrado." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center text-gray-500">
        {label}
      </td>
    </tr>
  );
}

// --- Página -----------------------------------------------------------------
export default function MyTickets() {
  const settings = useSelector((s) => s.settings);
  const navigate = useNavigate();

  const [fullList, setFullList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bloqueia acesso se não tiver setor/nome configurados
  useEffect(() => {
    if (!settings?.sector || !settings?.nameOrStore) {
      navigate("/settings", { replace: true });
    }
  }, [settings, navigate]);

  const debounceRef = useRef(null);

  const fetchData = async (params) => {
    setLoading(true);
    setError("");
    try {
      const data = await getTickets(params);
      setFullList(Array.isArray(data) ? data : []);
      setVisibleCount(10);
    } catch (e) {
      setError(e?.message || "Erro ao carregar chamados");
      setFullList([]);
    } finally {
      setLoading(false);
    }
  };

  // 1ª carga quando settings existir
  useEffect(() => {
    if (!settings?.sector || !settings?.nameOrStore) return;
    fetchData({
      sector: settings.sector,
      nameOrStore: settings.nameOrStore,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.sector, settings?.nameOrStore]);

  // reload ao mudar filtros (com debounce para 'q')
  useEffect(() => {
    if (!settings?.sector || !settings?.nameOrStore) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = {
        sector: settings.sector,
        nameOrStore: settings.nameOrStore,
      };
      if (status) params.status = status;
      if (q) params.q = q;
      fetchData(params);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  const sliced = useMemo(
    () => fullList.slice(0, visibleCount),
    [fullList, visibleCount]
  );
  const canLoadMore = visibleCount < fullList.length;

  const clearFilters = () => {
    setQ("");
    setStatus("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meus Chamados (TI)</h1>
          <p className="text-sm text-gray-600">
            <strong>Usuário:</strong> {settings?.nameOrStore || "-"} &middot;{" "}
            <strong>Setor:</strong> {settings?.sector || "-"}
          </p>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-white border rounded-2xl shadow-sm p-4">
        <div className="grid gap-3 md:grid-cols-[1fr,220px,110px]">
          {/* Busca */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Buscar por título ou descrição…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Status */}
          <select
            className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizado">Finalizado</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 text-sm"
          >
            Limpar
          </button>
        </div>
      </section>

      {/* Tabela */}
      <section className="overflow-hidden border border-gray-200 rounded-xl bg-white">
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
            {error && (
              <tr>
                <td colSpan={5} className="p-4">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                </td>
              </tr>
            )}

            {!error && loading && <LoadingRow colSpan={5} />}

            {!error && !loading && sliced.length === 0 && (
              <EmptyRow
                colSpan={5}
                label="Você ainda não tem chamados com os filtros atuais."
              />
            )}

            {!error &&
              !loading &&
              sliced.map((t) => (
                <tr key={t.id} className="odd:bg-white even:bg-gray-50/60">
                  <td className="p-3 text-gray-700">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-3 font-medium text-gray-900">{t.title}</td>
                  <td className="p-3 text-gray-700 whitespace-pre-wrap">
                    {t.description?.trim() || "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="p-3 text-gray-700 whitespace-pre-wrap">
                    {t.response?.trim() || "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Paginação: Carregar mais */}
      {!loading && !error && canLoadMore && (
        <div className="text-center">
          <button
            onClick={() => setVisibleCount((v) => v + 10)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Carregar mais
          </button>
        </div>
      )}
    </div>
  );
}
