import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function OrderList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      setErr("");
      const data = await api.getOrders();
      setRows(data);
    } catch (e) {
      setErr(e.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id, status, response) => {
    try {
      setSavingId(id);
      await api.setOrderStatus(id, { status, response });
      await load();
    } catch (e) {
      alert(e.message || "Erro ao salvar");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Pedidos</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Solicitante</th>
              <th className="p-2 border">Setor</th>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qtd</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Resposta</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="p-2 border">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                </td>
                <td className="p-2 border">
                  {o.requesterName || o.nameOrStore || "-"}
                </td>
                <td className="p-2 border">
                  {o.requesterSector || o.sector || "-"}
                </td>
                <td className="p-2 border">{o.item}</td>
                <td className="p-2 border">{o.qty}</td>
                <td className="p-2 border">{o.status}</td>
                <td className="p-2 border">{o.response || "-"}</td>
                <td className="p-2 border">
                  <button
                    disabled={savingId === o.id}
                    onClick={() =>
                      update(
                        o.id,
                        o.status === "aberto" ? "em_andamento" : "finalizado"
                      )
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-60"
                  >
                    {o.status === "aberto" ? "Em andamento" : "Finalizar"}
                  </button>
                  <button
                    disabled={savingId === o.id}
                    onClick={() => {
                      const resp = prompt(
                        "Mensagem ao solicitante:",
                        o.response || ""
                      );
                      if (resp !== null) update(o.id, o.status, resp);
                    }}
                    className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-60"
                  >
                    Responder
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-4 border text-center" colSpan={8}>
                  Nenhum pedido.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
