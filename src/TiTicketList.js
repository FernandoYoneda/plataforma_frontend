// src/TiTicketList.js
import React, { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { useDispatch, useSelector } from "react-redux";

export default function TiTicketList() {
  const dispatch = useDispatch();
  const tickets = useSelector((s) => s.tiTickets);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  const load = async () => {
    try {
      setErr("");
      const data = await api.getTiTickets();
      dispatch({ type: "SET_TI_TICKETS", payload: data });
    } catch (e) {
      setErr(e.message || "Falha ao carregar");
    }
  };

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const update = async (t, fields) => {
    const next = { ...t, ...fields };
    dispatch({
      type: "SET_TI_TICKETS",
      payload: tickets.map((x) => (x.id === t.id ? next : x)),
    });
    try {
      await api.setTiTicketStatus(t.id, {
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
      <h1 className="text-2xl font-bold mb-4">Chamados de TI</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Título</th>
              <th className="p-2 border">Descrição</th>
              <th className="p-2 border">Setor</th>
              <th className="p-2 border">Nome/Loja</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Resposta</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className={t.status === "finalizado" ? "opacity-70" : ""}
              >
                <td className="p-2 border">
                  {new Date(t.createdAt).toLocaleString()}
                </td>
                <td className="p-2 border">{t.title}</td>
                <td className="p-2 border">{t.description}</td>
                <td className="p-2 border">{t.sector || "-"}</td>
                <td className="p-2 border">{t.nameOrStore || "-"}</td>
                <td className="p-2 border">
                  <select
                    value={t.status}
                    onChange={(e) => update(t, { status: e.target.value })}
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
                    value={t.response || ""}
                    placeholder="Resposta ao solicitante"
                    onChange={(e) => update(t, { response: e.target.value })}
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
