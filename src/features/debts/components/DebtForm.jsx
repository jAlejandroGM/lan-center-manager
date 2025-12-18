import React, { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

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
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            placeholder="Nombre del Cliente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="w-full md:w-48">
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
            required
            min="0"
            step="0.10"
          />
        </div>
        <Button
          type="submit"
          isLoading={loading}
          disabled={!name || !amount}
          className="w-full md:w-auto"
        >
          Agregar
        </Button>
      </div>
    </form>
  );
};

export default DebtForm;
