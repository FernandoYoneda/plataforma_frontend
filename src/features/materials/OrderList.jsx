// src/features/materials/OrderList.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getOrders, updateOrder } from "../../services/api";

// --- UI helpers -------------------------------------------------------------
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
export default function OrderList() {
  // dados
  const [fullList, setFullList] = useState([]); // lista completa retornada do backend
  const [visibleCount, setVisibleCount] = useState(10); // paginação “carregar mais”
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros (controlados)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sector, setSector] = useState("");
  const [requester, setRequester] = useState("");

  // debounce para busca
  const debounceRef = useRef(null);

  // montar query params e buscar
  const fetchData = async (paramsObj) => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders(paramsObj);
      setFullList(Array.isArray(data) ? data : []);
      setVisibleCount(10); // sempre volta para a 1ª "página" quando muda o filtro
    } catch (e) {
      setError(e?.message || "Erro ao carregar pedidos");
      setFullList([]);
    } finally {
      setLoading(false);
    }
  };

  // primeira carga
  useEffect(() => {
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-carregar quando filtros mudam (q usa debounce)
  useEffect(() => {
    // limpar timer anterior, se houver
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // espera 350ms para evitar request por tecla
    debounceRef.current = setTimeout(() => {
      const params = {};
      if (q) params.q = q;
      if (status) params.status = status;
      if (sector) params.sector = sector;
      if (requester) params.nameOrStore = requester;

      fetchData(params);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, sector, requester]);

  // opções únicas para selects
  const sectorOptions = useMemo(() => {
    const set = new Set();
    fullList.forEach((o) => o?.sector && set.add(o.sector));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [fullList]);

  const requesterOptions = useMemo(() => {
    const set = new Set();
    fullList.forEach((o) => o?.nameOrStore && set.add(o.nameOrStore));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [fullList]);

  // update de status/response
  const onUpdate = async (id, patch) => {
    try {
      await updateOrder(id, patch);
      // refetch mantendo filtros atuais
      const params = {};
      if (q) params.q = q;
      if (status) params.status = status;
      if (sector) params.sector = sector;
      if (requester) params.nameOrStore = requester;
      await fetchData(params);
    } catch (e) {
      alert(e?.message || "Erro ao atualizar pedido");
    }
  };

  // listagem “paginada” (fatiada)
  const sliced = fullList.slice(0, visibleCount);
  const canLoadMore = visibleCount < fullList.length;

  const clearFilters = () => {
    setQ("");
    setStatus("");
    setSector("");
    setRequester("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Título */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Lista de Pedidos</h1>
          <p className="text-sm text-gray-600">
            Filtre, responda e atualize os pedidos de materiais.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-white border rounded-2xl shadow-sm p-4">
        <div className="grid gap-3 md:grid-cols-[1fr,180px,220px,220px]">
          {/* busca */}
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {/* ícone lupa */}
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
              placeholder="Buscar por item, observação ou resposta…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* status */}
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

          {/* setor */}
          <select
            className="px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {sectorOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* solicitante */}
          <div className="flex gap-2">
            <select
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
            >
              <option value="">Todos os solicitantes</option>
              {requesterOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="whitespace-nowrap px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 text-sm"
              title="Limpar filtros"
            >
              Limpar
            </button>
          </div>
        </div>
      </section>

      {/* Tabela */}
      <section className="overflow-hidden border border-gray-200 rounded-xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Solicitante</th>
              <th className="text-left p-3">Setor</th>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Qtd</th>
              <th className="text-left p-3">Obs</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Feedback</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={9} className="p-4">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                </td>
              </tr>
            )}

            {!error && loading && <LoadingRow colSpan={9} />}

            {!error && !loading && sliced.length === 0 && (
              <EmptyRow colSpan={9} />
            )}

            {!error &&
              !loading &&
              sliced.map((o) => (
                <tr
                  key={o.id}
                  className="odd:bg-white even:bg-gray-50/60 align-top"
                >
                  <td className="p-3 text-gray-700">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    {o.nameOrStore}
                  </td>
                  <td className="p-3 text-gray-700">{o.sector}</td>
                  <td className="p-3 text-gray-700">{o.item}</td>
                  <td className="p-3 text-gray-700">{o.quantity}</td>
                  <td className="p-3 text-gray-700 whitespace-pre-wrap">
                    {o.obs?.trim() || "-"}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-gray-700 whitespace-pre-wrap">
                    {o.response?.trim() || "-"}
                  </td>
                  <td className="p-3 space-y-2 w-56">
                    <select
                      className="border rounded px-2 py-1 text-sm w-full"
                      value={o.status}
                      onChange={(e) =>
                        onUpdate(o.id, { status: e.target.value })
                      }
                    >
                      <option value="aberto">Aberto</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="finalizado">Finalizado</option>
                    </select>

                    <textarea
                      className="border rounded p-2 text-sm w-full"
                      rows={3}
                      defaultValue={o.response || ""}
                      placeholder="Escreva um feedback ao solicitante…"
                      onBlur={(e) =>
                        onUpdate(o.id, { response: e.target.value })
                      }
                    />
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
