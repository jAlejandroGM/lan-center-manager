import React, { useState } from "react";
import { Save } from "lucide-react";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

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
    <Card className="p-6 mb-6">
      <CardTitle className="mb-4">Registro de Ingresos</CardTitle>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col h-full gap-6">
            <Input
              label="Efectivo"
              type="number"
              name="cash_income"
              value={formData.cash_income}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              tabIndex={1}
            />

            <Input
              label="Amanecidas"
              type="number"
              name="night_shift_income"
              value={formData.night_shift_income}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              tabIndex={3}
            />

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                placeholder="Observaciones del día..."
                tabIndex={5}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col h-full gap-6">
            <Input
              label="Yape"
              type="number"
              name="yape_income"
              value={formData.yape_income}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              tabIndex={2}
            />

            <Input
              label="Faltante"
              type="number"
              name="shortage_amount"
              value={formData.shortage_amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              tabIndex={4}
            />

            <div className="mt-auto pt-6">
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="w-full flex items-center justify-center gap-2"
                tabIndex={6}
              >
                <Save className="w-4 h-4" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default DailyLogForm;
