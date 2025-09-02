// src/pages/DashboardResponsavel.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  getTickets,
  updateOrder,
  updateTicket,
} from "../services/api";

// Badge de status reaproveitável
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

// Card simples de KPI
function KpiCard({ title, value, sub }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

// Cabeçalho bonito da página
function PageHeader() {
  return (
    <section className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
      <div className="relative px-5 py-8 md:px-8 md:py-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold">
          Visão Geral — Responsáveis
        </h1>
        <p className="text-white/90 mt-1">
          Acompanhe pedidos de Materiais e Chamados de TI em um só lugar.
        </p>
      </div>
    </section>
  );
}

// Barra de paginação (contador + tamanho de página + navegação)
function Pager({
  total,
  page,
  pageSize,
  setPage,
  setPageSize,
  label = "registros",
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);

  const goFirst = () => setPage(1);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goLast = () => setPage(totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-gray-600">
        Exibindo{" "}
        <strong>
          {total === 0 ? 0 : startIndex + 1}–{endIndex}
        </strong>{" "}
        de <strong>{total}</strong> {label}
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
            Página <strong>{safePage}</strong> de <strong>{totalPages}</strong>
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
  );
}

export default function DashboardResponsavel() {
  // ------- Materiais -------
  const [orders, setOrders] = useState([]);
  const [qOrders, setQOrders] = useState("");
  const [statusOrders, setStatusOrders] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errOrders, setErrOrders] = useState("");

  // paginação — materiais
  const [pageO, setPageO] = useState(1);
  const [pageSizeO, setPageSizeO] = useState(10);

  // ------- TI -------
  const [tickets, setTickets] = useState([]);
  const [qTickets, setQTickets] = useState("");
  const [statusTickets, setStatusTickets] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [errTickets, setErrTickets] = useState("");

  // paginação — TI
  const [pageT, setPageT] = useState(1);
  const [pageSizeT, setPageSizeT] = useState(10);

  // KPIs derivadas dos dados carregados
  const kpiOrders = useMemo(() => {
    const total = orders.length;
    const emAnd = orders.filter((o) => o.status === "em_andamento").length;
    const final = orders.filter((o) => o.status === "finalizado").length;
    return { total, emAnd, final };
  }, [orders]);

  const kpiTickets = useMemo(() => {
    const total = tickets.length;
    const emAnd = tickets.filter((t) => t.status === "em_andamento").length;
    const final = tickets.filter((t) => t.status === "finalizado").length;
    return { total, emAnd, final };
  }, [tickets]);

  // ------ Loads com debounce ------
  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoadingOrders(true);
      setErrOrders("");
      try {
        const params = {};
        if (statusOrders) params.status = statusOrders;
        if (qOrders) params.q = qOrders;
        const data = await getOrders(params);
        setOrders(Array.isArray(data) ? data : []);
        setPageO(1);
      } catch (e) {
        setErrOrders(e.message || "Erro ao carregar pedidos");
      } finally {
        setLoadingOrders(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [qOrders, statusOrders]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoadingTickets(true);
      setErrTickets("");
      try {
        const params = {};
        if (statusTickets) params.status = statusTickets;
        if (qTickets) params.q = qTickets;
        const data = await getTickets(params);
        setTickets(Array.isArray(data) ? data : []);
        setPageT(1);
      } catch (e) {
        setErrTickets(e.message || "Erro ao carregar chamados");
      } finally {
        setLoadingTickets(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [qTickets, statusTickets]);

  // ------ Ações rápidas (status/feedback) ------
  const updateOrderQuick = async (id, patch) => {
    try {
      await updateOrder(id, patch);
      // reload leve
      const params = {};
      if (statusOrders) params.status = statusOrders;
      if (qOrders) params.q = qOrders;
      const data = await getOrders(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message || "Erro ao atualizar pedido");
    }
  };

  const updateTicketQuick = async (id, patch) => {
    try {
      await updateTicket(id, patch);
      const params = {};
      if (statusTickets) params.status = statusTickets;
      if (qTickets) params.q = qTickets;
      const data = await getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
    } catch (e) {
      alert(e.message || "Erro ao atualizar chamado");
    }
  };

  // ------ Paginação client-side ------
  // Materiais
  const totalO = orders.length;
  const totalPagesO = Math.max(1, Math.ceil(totalO / pageSizeO));
  const safePageO = Math.min(pageO, totalPagesO);
  const startO = (safePageO - 1) * pageSizeO;
  const endO = Math.min(totalO, startO + pageSizeO);
  const visibleOrders = orders.slice(startO, endO);

  // TI
  const totalT = tickets.length;
  const totalPagesT = Math.max(1, Math.ceil(totalT / pageSizeT));
  const safePageT = Math.min(pageT, totalPagesT);
  const startT = (safePageT - 1) * pageSizeT;
  const endT = Math.min(totalT, startT + pageSizeT);
  const visibleTickets = tickets.slice(startT, endT);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <PageHeader />

      {/* KPIs */}
      <section className="grid md:grid-cols-3 gap-4">
        <KpiCard
          title="Pedidos totais"
          value={kpiOrders.total}
          sub={`${kpiOrders.emAnd} em andamento · ${kpiOrders.final} finalizados`}
        />
        <KpiCard
          title="Chamados TI totais"
          value={kpiTickets.total}
          sub={`${kpiTickets.emAnd} em andamento · ${kpiTickets.final} finalizados`}
        />
        <KpiCard title="Painel" value="Consolidado" sub="Materiais + TI" />
      </section>

      {/* -------- Materiais -------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos de Materiais</h2>
        </div>

        {/* Filtros (no card branco, abaixo do topo azul) */}
        <div className="bg-white border rounded-xl p-3 grid lg:grid-cols-3 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm lg:col-span-2"
            placeholder="Buscar por item/observação/feedback/solicitante"
            value={qOrders}
            onChange={(e) => setQOrders(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusOrders}
            onChange={(e) => setStatusOrders(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        {/* Paginação header */}
        <Pager
          total={totalO}
          page={safePageO}
          pageSize={pageSizeO}
          setPage={setPageO}
          setPageSize={setPageSizeO}
          label="pedidos"
        />

        {errOrders && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errOrders}
          </div>
        )}

        {loadingOrders ? (
          <div className="text-gray-600">Carregando pedidos…</div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
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
                {visibleOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  visibleOrders.map((o) => (
                    <tr
                      key={o.id}
                      className="odd:bg-white even:bg-gray-50/60 align-top"
                    >
                      <td className="p-3 text-gray-700">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "-"}
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
                            updateOrderQuick(o.id, { status: e.target.value })
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
                          placeholder="Feedback ao solicitante…"
                          onBlur={(e) =>
                            updateOrderQuick(o.id, { response: e.target.value })
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* -------- TI -------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chamados de TI</h2>
        </div>

        <div className="bg-white border rounded-xl p-3 grid lg:grid-cols-3 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm lg:col-span-2"
            placeholder="Buscar por título/descrição/feedback/solicitante"
            value={qTickets}
            onChange={(e) => setQTickets(e.target.value)}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={statusTickets}
            onChange={(e) => setStatusTickets(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="finalizado">Finalizado</option>
          </select>
        </div>

        <Pager
          total={totalT}
          page={safePageT}
          pageSize={pageSizeT}
          setPage={setPageT}
          setPageSize={setPageSizeT}
          label="chamados"
        />

        {errTickets && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errTickets}
          </div>
        )}

        {loadingTickets ? (
          <div className="text-gray-600">Carregando chamados…</div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-3">Data</th>
                  <th className="text-left p-3">Solicitante</th>
                  <th className="text-left p-3">Setor</th>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Feedback</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visibleTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-500">
                      Nenhum chamado encontrado.
                    </td>
                  </tr>
                ) : (
                  visibleTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="odd:bg-white even:bg-gray-50/60 align-top"
                    >
                      <td className="p-3 text-gray-700">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {t.nameOrStore}
                      </td>
                      <td className="p-3 text-gray-700">{t.sector}</td>
                      <td className="p-3 text-gray-700">{t.title}</td>
                      <td className="p-3 text-gray-700 whitespace-pre-wrap">
                        {t.description?.trim() || "-"}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="p-3 text-gray-700 whitespace-pre-wrap">
                        {t.response?.trim() || "-"}
                      </td>
                      <td className="p-3 space-y-2 w-56">
                        <select
                          className="border rounded px-2 py-1 text-sm w-full"
                          value={t.status}
                          onChange={(e) =>
                            updateTicketQuick(t.id, { status: e.target.value })
                          }
                        >
                          <option value="aberto">Aberto</option>
                          <option value="em_andamento">Em andamento</option>
                          <option value="finalizado">Finalizado</option>
                        </select>
                        <textarea
                          className="border rounded p-2 text-sm w-full"
                          rows={3}
                          defaultValue={t.response || ""}
                          placeholder="Feedback ao solicitante…"
                          onBlur={(e) =>
                            updateTicketQuick(t.id, {
                              response: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
