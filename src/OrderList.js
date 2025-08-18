// src/OrderList.js
import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useDispatch, useSelector } from "react-redux";

export default function OrderList() {
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.orders);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await api.getOrders();
        dispatch({ type: "SET_ORDERS", payload: data });
      } catch (e) {
        setErr(e.message || "Falha ao carregar pedidos");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Pedidos</h1>
      {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
      {loading ? (
        <div>Carregando...</div>
      ) : orders.length === 0 ? (
        <div>Nenhum pedido encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border">Data</th>
                <th className="p-2 text-left border">Item</th>
                <th className="p-2 text-left border">Qtd</th>
                <th className="p-2 text-left border">Setor</th>
                <th className="p-2 text-left border">Nome/Loja</th>
                <th className="p-2 text-left border">Obs</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border">{o.item}</td>
                  <td className="p-2 border">{o.qty}</td>
                  <td className="p-2 border">{o.sector || "-"}</td>
                  <td className="p-2 border">{o.nameOrStore || "-"}</td>
                  <td className="p-2 border">{o.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
