import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);
  const [sector, setSector] = useState(settings.sector);
  const [nameOrStore, setNameOrStore] = useState(settings.nameOrStore);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!sector || !nameOrStore) {
      setError("Por favor, preencha ambos os campos: Setor e Nome/Loja.");
      return;
    }

    const updatedSettings = { sector, nameOrStore };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/settings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSettings),
        }
      );
      if (!response.ok) throw new Error("Erro ao salvar configurações");
      dispatch({ type: "UPDATE_SETTINGS", payload: updatedSettings });
      setError("");
      navigate("/");
    } catch (error) {
      setError("Erro ao salvar configurações. Tente novamente.");
      console.error("Erro ao salvar configurações:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Configurações</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Setor</label>
          <input
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite o setor"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nome/Loja</label>
          <input
            type="text"
            value={nameOrStore}
            onChange={(e) => setNameOrStore(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Digite o nome ou loja"
            required
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default Settings;
