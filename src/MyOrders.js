// src/MyOrders.js
import React, { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useSelector } from "react-redux";

export default function MyOrders() {
  const settings = useSelector((s) => s.settings);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  const load = async () => {
    try {
      setErr("");
      const data = await api.getOrders({
        sector: settings?.sector || "",
        nameOrStore: settings?.nameOrStore || "",
      });
      setRows(data);
    } catch (e) {
      setErr(e.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 5000);
    return () => clearInterval(timerRef.current);
  }, [settings?.sector, settings?.nameOrStore]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Meus Pedidos</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qtd</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Resposta do responsável</th>
              <th className="p-2 border">Atualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="p-2 border">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">{o.item}</td>
                <td className="p-2 border">{o.qty}</td>
                <td className="p-2 border font-medium">
                  {o.status === "finalizado"
                    ? "Finalizado ✅"
                    : o.status === "em_andamento"
                    ? "Em andamento ⏳"
                    : "Aberto 📨"}
                </td>
                <td className="p-2 border">{o.response || "-"}</td>
                <td className="p-2 border">
                  {new Date(o.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Atualiza automaticamente a cada 5s.
      </p>
    </div>
  );
}
