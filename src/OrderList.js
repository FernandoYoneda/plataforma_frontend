import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import React from 'react'

const OrderList = () => {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.orders);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/orders`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        dispatch({ type: "SET_ORDERS", payload: data });
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    };

    fetchOrders();
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Pedidos</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-md shadow-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left p-3 text-sm font-medium text-gray-700">
                  Material
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">
                  Quantidade
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">
                  Setor
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">
                  Nome/Loja
                </th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900">
                    {order.material}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    {order.quantity}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    {order.sector || "Não definido"}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    {order.nameOrStore || "Não definido"}
                  </td>
                  <td className="p-3 text-sm text-gray-900">
                    {new Date(order.date).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
