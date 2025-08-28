// src/features/materials/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../../services/api";

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

export default function MyOrders() {
  const settings = useSelector((s) => s.settings);
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // bloqueia acesso se não tiver setor/nome configurados
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

      const data = await getOrders(params);
      setList(data || []);
    } catch (e) {
      setError(e.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  // carrega ao abrir e quando filtros mudam
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, settings?.sector, settings?.nameOrStore]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meus Pedidos (Materiais)</h1>
          <p className="text-sm text-gray-600">
            <strong>Usuário:</strong> {settings?.nameOrStore || "-"} &middot{" "}
            <strong>Setor:</strong> {settings?.sector || "-"}
          </p>
        </div>

        {/* Filtros do solicitante */}
        <div className="bg-white border rounded-xl p-3 grid md:grid-cols-3 gap-3">
          <input
            className="border rounded px-2 py-1 text-sm md:col-span-2"
            placeholder="Buscar por item/observação"
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
        <div className="overflow-hidden border border-gray-200 rounded-xl bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Qtd</th>
                <th className="text-left p-3">Obs</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Feedback do responsável</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">
                    Você ainda não tem pedidos com os filtros atuais.
                  </td>
                </tr>
              ) : (
                list.map((o) => (
                  <tr key={o.id} className="odd:bg-white even:bg-gray-50/60">
                    <td className="p-3 text-gray-700">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-gray-900">{o.item}</td>
                    <td className="p-3 text-gray-700">{o.quantity}</td>
                    <td className="p-3 text-gray-700">{o.obs || "-"}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-gray-700">
                      {o.response?.trim() || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
