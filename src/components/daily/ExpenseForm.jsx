import React, { useState } from "react";
import { Plus } from "lucide-react";
import { EXPENSE_CATEGORIES, EXPENSE_LABELS } from "../../constants";
import { getTodayLimaISO } from "../../utils/dateUtils";

const ExpenseForm = ({ onAdd, selectedDate }) => {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES.OTHER);
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 0) return;

    setIsSubmitting(true);
    const success = await onAdd({
      category,
      detail,
      amount: parseFloat(amount),
      // Usamos la fecha seleccionada por el padre, o fallback a hoy (Lima) si no existe
      date: selectedDate || getTodayLimaISO(),
    });
    setIsSubmitting(false);

    if (success) {
      setDetail("");
      setAmount("");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Registro de Gastos</h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setDetail("");
          }}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          {Object.values(EXPENSE_CATEGORIES).map((cat) => (
            <option key={cat} value={cat}>
              {EXPENSE_LABELS[cat]}
            </option>
          ))}
        </select>

        {category === EXPENSE_CATEGORIES.STAFF_PAYMENT ? (
          <select
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
            required
          >
            <option value="">Seleccionar Staff</option>
            <option value="Staff A">Staff A</option>
            <option value="Staff B">Staff B</option>
          </select>
        ) : (
          <input
            type="text"
            placeholder="Nombre del producto"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
            required
          />
        )}

        <input
          type="number"
          placeholder="Monto (S/.)"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
              setAmount(val);
            }
          }}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
          step="0.01"
          min="0"
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />{" "}
          {isSubmitting ? "Agregando..." : "Agregar"}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
