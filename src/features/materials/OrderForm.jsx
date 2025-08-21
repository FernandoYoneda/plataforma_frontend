import React, { useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../services/api";

export default function OrderForm() {
  const settings = useSelector((s) => s.settings);
  const user = useSelector((s) => s.user);
  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await api.createOrder({
        item,
        qty,
        notes,
        sector: settings?.sector || null,
        nameOrStore: settings?.nameOrStore || null,
        requesterEmail: user?.email || null,
        requesterName: settings?.nameOrStore || null,
        requesterSector: settings?.sector || null,
      });
      setMsg("Pedido enviado!");
      setItem("");
      setQty(1);
      setNotes("");
    } catch (e1) {
      setErr(e1.message || "Erro ao enviar");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Novo Pedido</h1>
      <p className="text-sm mb-2 text-gray-600">
        Usuário: <b>{settings?.nameOrStore}</b> — Setor:{" "}
        <b>{settings?.sector}</b>
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Item</label>
          <input
            className="border rounded p-2 w-full"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Quantidade</label>
          <input
            className="border rounded p-2 w-full"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Observações</label>
          <textarea
            className="border rounded p-2 w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {err && <p className="text-red-600 text-sm">{err}</p>}
        {msg && <p className="text-green-700 text-sm">{msg}</p>}

        <button className="bg-blue-600 text-white rounded px-4 py-2">
          Enviar
        </button>
      </form>
    </div>
  );
}
