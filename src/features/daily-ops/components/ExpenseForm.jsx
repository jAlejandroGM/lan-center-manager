import React, { useState } from "react";
import { Plus } from "lucide-react";
import { EXPENSE_CATEGORIES, EXPENSE_LABELS } from "../../../config/constants";
import { getTodayLimaISO } from "../../../lib/dateUtils";
import { Card, CardTitle } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";

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
      date: selectedDate || getTodayLimaISO(),
    });
    setIsSubmitting(false);

    if (success) {
      setDetail("");
      setAmount("");
    }
  };

  return (
    <Card className="p-6">
      <CardTitle className="mb-4">Registro de Gastos</CardTitle>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setDetail("");
          }}
        >
          {Object.values(EXPENSE_CATEGORIES).map((cat) => (
            <option key={cat} value={cat}>
              {EXPENSE_LABELS[cat]}
            </option>
          ))}
        </Select>

        {category === EXPENSE_CATEGORIES.STAFF_PAYMENT ? (
          <Select
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
          >
            <option value="">Seleccionar Staff</option>
            <option value="Staff A">Staff A</option>
            <option value="Staff B">Staff B</option>
          </Select>
        ) : (
          <Input
            type="text"
            placeholder="Nombre del producto"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            required
          />
        )}

        <Input
          type="number"
          placeholder="Monto (S/.)"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
              setAmount(val);
            }
          }}
          step="0.01"
          min="0"
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="danger"
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />{" "}
          {isSubmitting ? "Agregando..." : "Agregar"}
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;
