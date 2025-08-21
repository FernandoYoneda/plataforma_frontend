import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function TiTicketList() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    try {
      setErr("");
      const data = await api.getTiTickets();
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
      await api.setTiTicketStatus(id, { status, response });
      await load();
    } catch (e) {
      alert(e.message || "Erro ao salvar");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Chamados de TI</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Data</th>
              <th className="p-2 border">Solicitante</th>
              <th className="p-2 border">Setor</th>
              <th className="p-2 border">Título</th>
              <th className="p-2 border">Descrição</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Resposta</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">
                  {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                </td>
                <td className="p-2 border">
                  {t.requesterName || t.nameOrStore || "-"}
                </td>
                <td className="p-2 border">
                  {t.requesterSector || t.sector || "-"}
                </td>
                <td className="p-2 border">{t.title}</td>
                <td className="p-2 border">{t.description}</td>
                <td className="p-2 border">{t.status}</td>
                <td className="p-2 border">{t.response || "-"}</td>
                <td className="p-2 border">
                  <button
                    disabled={savingId === t.id}
                    onClick={() =>
                      update(
                        t.id,
                        t.status === "aberto" ? "em_andamento" : "finalizado"
                      )
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-60"
                  >
                    {t.status === "aberto" ? "Em andamento" : "Finalizar"}
                  </button>
                  <button
                    disabled={savingId === t.id}
                    onClick={() => {
                      const resp = prompt(
                        "Mensagem ao solicitante:",
                        t.response || ""
                      );
                      if (resp !== null) update(t.id, t.status, resp);
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
                  Nenhum chamado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
