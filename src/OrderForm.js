// src/OrderForm.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "./api";

export default function OrderForm() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.settings);
  const user = useSelector((s) => s.user);

  const [item, setItem] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!item.trim() || !qty) {
      setMsg("Informe o item e a quantidade.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        item: item.trim(),
        qty: Number(qty),
        notes: notes.trim(),
        sector: settings?.sector || null,
        nameOrStore: settings?.nameOrStore || null,
        role: user?.role || null,
      };
      const created = await api.createOrder(payload);
      dispatch({ type: "ADD_ORDER", payload: created });

      setItem("");
      setQty(1);
      setNotes("");
      setMsg("Pedido criado com sucesso!");
    } catch (err) {
      setMsg(err.message || "Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <div className="text-sm text-gray-700">
          <strong>Usuário:</strong> {settings?.nameOrStore || "-"} &nbsp;|&nbsp;{" "}
          <strong>Setor:</strong> {settings?.sector || "-"}
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">Novo Pedido</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Item</label>
          <input
            className="w-full border rounded p-2"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="Ex: Papel A4"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Quantidade</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded p-2"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Observações (opcional)</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes do pedido"
          />
        </div>

        {msg && <div className="text-sm">{msg}</div>}

        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar Pedido"}
        </button>
      </form>
    </div>
  );
}
