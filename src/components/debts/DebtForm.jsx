import React, { useState } from "react";
import { PlusCircle } from "lucide-react";

const DebtForm = ({ onAdd, loading }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || parseFloat(amount) < 0) return;

    const success = await onAdd({
      customer_name: name,
      amount: parseFloat(amount),
    });

    if (success) {
      setName("");
      setAmount("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-400" />
        Nueva Deuda
      </h3>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Nombre del Cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          required
        />
        <input
          type="number"
          placeholder="Monto (S/.)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full md:w-32 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          step="0.10"
          min="0"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Agregando..." : "Agregar"}
        </button>
      </div>
    </form>
  );
};

export default DebtForm;
