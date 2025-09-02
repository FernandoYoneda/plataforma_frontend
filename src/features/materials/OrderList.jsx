// src/features/materials/OrderList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrder } from "../../services/api";

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

export default function OrderList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sector, setSector] = useState("");
  const [requester, setRequester] = useState("");

  // paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (status) params.status = status;
      if (sector) params.sector = sector;
      if (requester) params.nameOrStore = requester;
      if (q) params.q = q;

      const data = await getOrders(params);
      setList(Array.isArray(data) ? data : []);
      setPage(1); // resetar para primeira página quando filtros mudarem
    } catch (e) {
      setError(e.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300); // leve debouncing para busca
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, sector, requester]);

  // Opções únicas de filtros, derivadas da lista carregada
  const sectorOptions = useMemo(() => {
    const set = new Set();
    list.forEach((o) => o?.sector && set.add(o.sector));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  const requesterOptions = useMemo(() => {
    const set = new Set();
    list.forEach((o) => o?.nameOrStore && set.add(o.nameOrStore));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [list]);

  const onUpdate = async (id, patch) => {
    try {
      await updateOrder(id, patch);
      await load();
    } catch (e) {
      alert(e.message || "Erro ao atualizar pedido");
    }
  };

  // paginação (client-side)
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
          <h1 className="text-xl font-semibold">
            Lista de Pedidos (Materiais)
          </h1>
          <p className="text-sm text-gray-600">
            Visualize, filtre e atualize os pedidos.
          </p>
        </div>

        <div className="bg-white border rounded-xl p-3 grid lg:grid-cols-5 md:grid-cols-3 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm lg:col-span-2"
            placeholder="Buscar por item/obs/resposta"
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
          <select
            className="border rounded px-2 py-1 text-sm"
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
          <select
            className="border rounded px-2 py-1 text-sm"
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
              de <strong>{total}</strong> pedidos
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
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                ) : (
                  visible.map((o) => (
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
