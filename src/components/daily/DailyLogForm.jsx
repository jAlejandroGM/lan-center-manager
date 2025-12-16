import React, { useState } from "react";
import { Save } from "lucide-react";

const DailyLogForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    cash_income: initialData?.cash_income || "",
    yape_income: initialData?.yape_income || "",
    night_shift_income: initialData?.night_shift_income || "",
    shortage_amount: initialData?.shortage_amount || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "notes") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      cash_income:
        formData.cash_income === "" ? 0 : parseFloat(formData.cash_income),
      yape_income:
        formData.yape_income === "" ? 0 : parseFloat(formData.yape_income),
      night_shift_income:
        formData.night_shift_income === ""
          ? 0
          : parseFloat(formData.night_shift_income),
      shortage_amount:
        formData.shortage_amount === ""
          ? 0
          : parseFloat(formData.shortage_amount),
    };
    onSave(processedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-lg border border-gray-700  mb-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">
        Registro de Ingresos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col h-full gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Efectivo
            </label>
            <input
              type="number"
              name="cash_income"
              value={formData.cash_income}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
              tabIndex={1}
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
              placeholder="0.00"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              step="0.01"
              min="0"
              tabIndex={3}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white resize-none"
              rows="1"
              tabIndex={5}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col h-full gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Yape
            </label>
            <input
              type="number"
              name="yape_income"
              value={formData.yape_income}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              step="0.01"
              min="0"
              tabIndex={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Dinero Faltante
            </label>
            <input
              type="number"
              name="shortage_amount"
              value={formData.shortage_amount}
              placeholder="0.00"
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              step="0.01"
              min="0"
              tabIndex={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 opacity-0">
              Guardar
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              tabIndex={6}
            >
              <Save className="w-4 h-4" />{" "}
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default DailyLogForm;
