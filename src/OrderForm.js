import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const OrderForm = () => {
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!material || !quantity) return;

    const order = {
      material,
      quantity: parseInt(quantity),
      sector: settings.sector,
      nameOrStore: settings.nameOrStore,
      date: new Date().toISOString(),
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        }
      );
      const data = await response.json();
      dispatch({ type: "ADD_ORDER", payload: data });
      setMaterial("");
      setQuantity("");
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Novo Pedido</h2>
      <div className="mb-4">
        <p>
          <strong>Setor:</strong> {settings.sector || "Não definido"}
        </p>
        <p>
          <strong>Nome/Loja:</strong> {settings.nameOrStore || "Não definido"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Material</label>
          <input
            type="text"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite o material"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Quantidade</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite a quantidade"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Enviar Pedido
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
