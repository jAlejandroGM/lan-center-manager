import React, { useState } from "react";
import { PlusCircle } from "lucide-react";

const DebtForm = ({ onAdd, loading }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || parseFloat(amount) < 0) return;

    const success = await onAdd({
      customer_name: name,
      amount: parseFloat(amount),
      created_at: date,
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
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          required
        />
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
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*\.?\d{0,1}$/.test(val)) {
              setAmount(val);
            }
          }}
          className="w-full md:w-32 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          step="0.1"
          min="0"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Agregando..." : "Agregar"}
        </button>
      </div>
    </form>
  );
};

export default DebtForm;
