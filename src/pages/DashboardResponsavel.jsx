// src/pages/DashboardResponsavel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getOrders,
  getTickets,
  updateOrder,
  updateTicket,
} from "../services/api";

// ----------------- UI helpers -----------------
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

function KPICard({ title, value, sub }) {
  return (
    <div className="p-5 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function TableShell({ children, title, description, actions }) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        {actions}
      </div>
      <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
        {children}
      </div>
    </section>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const nums = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, page + 2);
  if (from > 1) nums.push(1, "…");
  for (let i = from; i <= to; i++) nums.push(i);
  if (to < totalPages) nums.push("…", totalPages);

  return (
    <div className="flex items-center justify-end gap-2 p-3">
      <button
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Anterior
      </button>
      {nums.map((n, idx) =>
        typeof n === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(n)}
            className={`px-3 py-1.5 rounded-lg border text-sm ${
              n === page ? "bg-gray-900 text-white border-gray-900" : "bg-white"
            }`}
          >
            {n}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            {n}
          </span>
        )
      )}
      <button
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Próxima
      </button>
    </div>
  );
}

// ----------------- Página -----------------
export default function DashboardResponsavel() {
  const user = useSelector((s) => s.user); // { role: 'responsavel' | 'responsavel_ti' }

  // Materiais
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [ordersQ, setOrdersQ] = useState("");
  const [ordersStatus, setOrdersStatus] = useState("");
  const [ordersPage, setOrdersPage] = useState(1);

  // TI
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketsQ, setTicketsQ] = useState("");
  const [ticketsStatus, setTicketsStatus] = useState("");
  const [ticketsPage, setTicketsPage] = useState(1);

  // debounce refs
  const oDebRef = useRef(null);
  const tDebRef = useRef(null);

  const PAGE_SIZE = 10;

  const fetchOrders = async (params = {}) => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getOrders(params);
      setOrders(Array.isArray(data) ? data : []);
      setOrdersPage(1);
    } catch (e) {
      setOrders([]);
      setOrdersError(e?.message || "Erro ao carregar pedidos");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchTickets = async (params = {}) => {
    setTicketsLoading(true);
    setTicketsError("");
    try {
      const data = await getTickets(params);
      setTickets(Array.isArray(data) ? data : []);
      setTicketsPage(1);
    } catch (e) {
      setTickets([]);
      setTicketsError(e?.message || "Erro ao carregar chamados");
    } finally {
      setTicketsLoading(false);
    }
  };

  // 1ª carga, respeitando o papel:
  useEffect(() => {
    if (!user?.role) return;
    if (user.role === "responsavel") {
      // Materiais apenas
      fetchOrders({});
      setTickets([]); // garante que TI não aparece
    } else if (user.role === "responsavel_ti") {
      // TI apenas
      fetchTickets({});
      setOrders([]); // garante que Materiais não aparece
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // filtros (Materiais) com debounce
  useEffect(() => {
    if (user?.role !== "responsavel") return;
    if (oDebRef.current) clearTimeout(oDebRef.current);
    oDebRef.current = setTimeout(() => {
      const p = {};
      if (ordersQ) p.q = ordersQ;
      if (ordersStatus) p.status = ordersStatus;
      fetchOrders(p);
    }, 350);
    return () => oDebRef.current && clearTimeout(oDebRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersQ, ordersStatus, user?.role]);

  // filtros (TI) com debounce
  useEffect(() => {
    if (user?.role !== "responsavel_ti") return;
    if (tDebRef.current) clearTimeout(tDebRef.current);
    tDebRef.current = setTimeout(() => {
      const p = {};
      if (ticketsQ) p.q = ticketsQ;
      if (ticketsStatus) p.status = ticketsStatus;
      fetchTickets(p);
    }, 350);
    return () => tDebRef.current && clearTimeout(tDebRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsQ, ticketsStatus, user?.role]);

  // KPIs simples (apenas do bloco visível)
  const kpis = useMemo(() => {
    if (user?.role === "responsavel") {
      return {
        blocks: "orders",
        open: orders.filter((o) => o.status === "aberto").length,
        prog: orders.filter((o) => o.status === "em_andamento").length,
        done: orders.filter((o) => o.status === "finalizado").length,
      };
    }
    if (user?.role === "responsavel_ti") {
      return {
        blocks: "tickets",
        open: tickets.filter((t) => t.status === "aberto").length,
        prog: tickets.filter((t) => t.status === "em_andamento").length,
        done: tickets.filter((t) => t.status === "finalizado").length,
      };
    }
    return { blocks: "", open: 0, prog: 0, done: 0 };
  }, [user?.role, orders, tickets]);

  // paginação (Materiais)
  const ordersTotalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const ordersSlice = useMemo(() => {
    const start = (ordersPage - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, ordersPage]);

  // paginação (TI)
  const ticketsTotalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const ticketsSlice = useMemo(() => {
    const start = (ticketsPage - 1) * PAGE_SIZE;
    return tickets.slice(start, start + PAGE_SIZE);
  }, [tickets, ticketsPage]);

  // ações inline
  const handleOrderUpdate = async (id, patch) => {
    try {
      await updateOrder(id, patch);
      const p = {};
      if (ordersQ) p.q = ordersQ;
      if (ordersStatus) p.status = ordersStatus;
      await fetchOrders(p);
    } catch (e) {
      alert(e?.message || "Erro ao atualizar pedido");
    }
  };

  const handleTicketUpdate = async (id, patch) => {
    try {
      await updateTicket(id, patch);
      const p = {};
      if (ticketsQ) p.q = ticketsQ;
      if (ticketsStatus) p.status = ticketsStatus;
      await fetchTickets(p);
    } catch (e) {
      alert(e?.message || "Erro ao atualizar chamado");
    }
  };

  const isRespMateriais = user?.role === "responsavel";
  const isRespTI = user?.role === "responsavel_ti";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {isRespMateriais
              ? "Visão Geral — Responsável (Materiais)"
              : isRespTI
              ? "Visão Geral — Responsável (TI)"
              : "Visão Geral"}
          </h1>
          <p className="text-white/90 mt-1">
            {isRespMateriais
              ? "Acompanhe e responda aos pedidos das lojas e setores."
              : isRespTI
              ? "Acompanhe e responda aos chamados de TI."
              : "Acompanhe tudo em um único lugar."}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* KPIs focados no bloco do papel */}
        <section className="grid md:grid-cols-3 gap-4">
          <KPICard
            title={isRespMateriais ? "Pedidos Abertos" : "Chamados Abertos"}
            value={kpis.open}
          />
          <KPICard
            title={
              isRespMateriais ? "Pedidos em Andamento" : "Chamados em Andamento"
            }
            value={kpis.prog}
          />
          <KPICard
            title={
              isRespMateriais ? "Pedidos Finalizados" : "Chamados Finalizados"
            }
            value={kpis.done}
          />
        </section>

        {/* Materiais — visível apenas para 'responsavel' */}
        {isRespMateriais && (
          <TableShell
            title="Pedidos de Materiais"
            description="Lista paginada de pedidos das lojas e setores."
            actions={
              <div className="flex gap-2 items-center">
                <input
                  className="border rounded-xl px-3 py-2 text-sm"
                  placeholder="Buscar item/obs/resp…"
                  value={ordersQ}
                  onChange={(e) => setOrdersQ(e.target.value)}
                />
                <select
                  className="border rounded-xl px-3 py-2 text-sm"
                  value={ordersStatus}
                  onChange={(e) => setOrdersStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            }
          >
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
                {ordersError && (
                  <tr>
                    <td colSpan={9} className="p-4">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {ordersError}
                      </div>
                    </td>
                  </tr>
                )}

                {!ordersError && ordersLoading && (
                  <tr>
                    <td colSpan={9} className="p-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                        Carregando…
                      </div>
                    </td>
                  </tr>
                )}

                {!ordersError && !ordersLoading && ordersSlice.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}

                {!ordersError &&
                  !ordersLoading &&
                  ordersSlice.map((o) => (
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
                            handleOrderUpdate(o.id, { status: e.target.value })
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
                            handleOrderUpdate(o.id, {
                              response: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <Pagination
              page={ordersPage}
              totalPages={ordersTotalPages}
              onPageChange={setOrdersPage}
            />
          </TableShell>
        )}

        {/* TI — visível apenas para 'responsavel_ti' */}
        {isRespTI && (
          <TableShell
            title="Chamados de TI"
            description="Lista paginada de chamados de TI."
            actions={
              <div className="flex gap-2 items-center">
                <input
                  className="border rounded-xl px-3 py-2 text-sm"
                  placeholder="Buscar título/descrição/resp…"
                  value={ticketsQ}
                  onChange={(e) => setTicketsQ(e.target.value)}
                />
                <select
                  className="border rounded-xl px-3 py-2 text-sm"
                  value={ticketsStatus}
                  onChange={(e) => setTicketsStatus(e.target.value)}
                >
                  <option value="">Todos os status</option>
                  <option value="aberto">Aberto</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            }
          >
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
                {ticketsError && (
                  <tr>
                    <td colSpan={8} className="p-4">
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {ticketsError}
                      </div>
                    </td>
                  </tr>
                )}

                {!ticketsError && ticketsLoading && (
                  <tr>
                    <td colSpan={8} className="p-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
                        Carregando…
                      </div>
                    </td>
                  </tr>
                )}

                {!ticketsError &&
                  !ticketsLoading &&
                  ticketsSlice.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        Nenhum chamado encontrado.
                      </td>
                    </tr>
                  )}

                {!ticketsError &&
                  !ticketsLoading &&
                  ticketsSlice.map((t) => (
                    <tr
                      key={t.id}
                      className="odd:bg-white even:bg-gray-50/60 align-top"
                    >
                      <td className="p-3 text-gray-700">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString()
                          : "-"}
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
                            handleTicketUpdate(t.id, { status: e.target.value })
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
                            handleTicketUpdate(t.id, {
                              response: e.target.value,
                            })
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <Pagination
              page={ticketsPage}
              totalPages={ticketsTotalPages}
              onPageChange={setTicketsPage}
            />
          </TableShell>
        )}
      </main>
    </div>
  );
}
