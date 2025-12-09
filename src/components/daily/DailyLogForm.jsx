import React, { useState } from "react";
import { Save } from "lucide-react";

const DailyLogForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    cash_income: initialData?.cash_income || 0,
    yape_income: initialData?.yape_income || 0,
    night_shift_income: initialData?.night_shift_income || 0,
    shortage_amount: initialData?.shortage_amount || 0,
    notes: initialData?.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "notes" ? value : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700  mb-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">
        Registro de Ingresos Diarios
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Efectivo
          </label>
          <input
            type="number"
            name="cash_income"
            value={formData.cash_income}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white text-lg"
            step="0.10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Yape
          </label>
          <input
            type="number"
            name="yape_income"
            value={formData.yape_income}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white text-lg"
            step="0.10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Amanecidas
          </label>
          <input
            type="number"
            name="night_shift_income"
            value={formData.night_shift_income}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white text-lg"
            step="0.10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-red-400 mb-1">
            Dinero Faltante
          </label>
          <input
            type="number"
            name="shortage_amount"
            value={formData.shortage_amount}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-red-500/50 rounded text-white text-lg"
            step="0.10"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white"
            rows="3"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" />{" "}
        {loading ? "Guardando..." : "Guardar Registro Diario"}
      </button>
    </form>
  );
};

export default DailyLogForm;
