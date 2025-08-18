import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function OrderList() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const fetchOrders = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders`);
      if (!res.ok) throw new Error("Falha ao carregar pedidos");
      const data = await res.json();
      dispatch({ type: "SET_ORDERS", payload: data });
    } catch (e) {
      setErr(e.message || "Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/orders`);
        if (!res.ok) throw new Error("Falha ao carregar pedidos");
        const data = await res.json();
        if (!cancelled) dispatch({ type: "SET_ORDERS", payload: data });
      } catch (e) {
        if (!cancelled) setErr(e.message || "Erro ao carregar pedidos");
      }
    };

    load();

    // auto-refresh leve (10s)
    const id = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Lista de Pedidos</h1>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="bg-gray-800 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

      <div className="space-y-3">
        {(!orders || orders.length === 0) && (
          <div className="rounded border p-4 bg-white">
            Nenhum pedido ainda.
          </div>
        )}

        {orders.map((o) => (
          <div
            key={o.id ?? `${o.item}-${o.createdAt}`}
            className="rounded border p-4 bg-white shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div>
                <h2 className="font-semibold">
                  {o.item}{" "}
                  <span className="text-sm text-gray-500">× {o.qty}</span>
                </h2>
                {o.notes && (
                  <p className="text-sm text-gray-700 mt-1">{o.notes}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Setor: <span className="font-medium">{o.sector || "—"}</span>{" "}
                  • Nome/Loja:{" "}
                  <span className="font-medium">{o.nameOrStore || "—"}</span>
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <div className="mt-1">
                  Criado em:{" "}
                  {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
