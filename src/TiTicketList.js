// src/TiTicketList.js
import React, { useEffect, useState } from "react";
import { api } from "./api";
import { useDispatch, useSelector } from "react-redux";

export default function TiTicketList() {
  const dispatch = useDispatch();
  const tiTickets = useSelector((s) => s.tiTickets);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await api.getTiTickets();
        dispatch({ type: "SET_TI_TICKETS", payload: data });
      } catch (e) {
        setErr(e.message || "Falha ao carregar chamados");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Chamados de TI</h1>
      {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
      {loading ? (
        <div>Carregando...</div>
      ) : tiTickets.length === 0 ? (
        <div>Nenhum chamado encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border">Data</th>
                <th className="p-2 text-left border">Título</th>
                <th className="p-2 text-left border">Descrição</th>
                <th className="p-2 text-left border">Setor</th>
                <th className="p-2 text-left border">Nome/Loja</th>
                <th className="p-2 text-left border">Status</th>
              </tr>
            </thead>
            <tbody>
              {tiTickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="p-2 border">{t.title}</td>
                  <td className="p-2 border">{t.description}</td>
                  <td className="p-2 border">{t.sector || "-"}</td>
                  <td className="p-2 border">{t.nameOrStore || "-"}</td>
                  <td className="p-2 border">{t.status || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
