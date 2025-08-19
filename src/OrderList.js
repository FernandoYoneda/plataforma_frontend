// src/OrderList.js
import React, { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useDispatch, useSelector } from "react-redux";

export default function OrderList() {
  const dispatch = useDispatch();
  const orders = useSelector((s) => s.orders);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  const load = async () => {
    try {
      setErr("");
      const data = await api.getOrders();
      dispatch({ type: "SET_ORDERS", payload: data });
    } catch (e) {
      setErr(e.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const update = async (o, fields) => {
    const next = { ...o, ...fields };
    dispatch({
      type: "SET_ORDERS",
      payload: orders.map((x) => (x.id === o.id ? next : x)),
    });
    try {
      await api.setOrderStatus(o.id, {
        status: next.status,
        response: next.response,
      });
    } catch (e) {
      alert(e.message);
      load();
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
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qtd</th>
              <th className="p-2 border">Setor</th>
              <th className="p-2 border">Nome/Loja</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Resposta</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className={o.status === "finalizado" ? "opacity-70" : ""}
              >
                <td className="p-2 border">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">{o.item}</td>
                <td className="p-2 border">{o.qty}</td>
                <td className="p-2 border">{o.sector || "-"}</td>
                <td className="p-2 border">{o.nameOrStore || "-"}</td>
                <td className="p-2 border">
                  <select
                    value={o.status}
                    onChange={(e) => update(o, { status: e.target.value })}
                    className="border rounded p-1"
                  >
                    <option value="aberto">Aberto</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    className="border rounded p-1 w-64"
                    value={o.response || ""}
                    placeholder="Resposta ao solicitante"
                    onChange={(e) => update(o, { response: e.target.value })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
