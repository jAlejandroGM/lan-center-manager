import React, { useState } from "react";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import DailyLogForm from "../components/daily/DailyLogForm";
import ExpenseForm from "../components/daily/ExpenseForm";
import { useToast } from "../hooks/useToast";
import {
  getTodayLimaISO,
  combineDateWithCurrentTime,
} from "../utils/dateUtils";

const DailyEntry = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayLimaISO());
  const [savingLog, setSavingLog] = useState(false);
  const toast = useToast();

  const handleSaveLog = async (formData) => {
    try {
      setSavingLog(true);
      await logService.addLog({
        ...formData,
        date: selectedDate,
      });

      toast.success("Registro agregado exitosamente!");
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Error al guardar registro.");
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      const expenseWithTime = {
        ...expense,
        date: selectedDate,
        created_at: combineDateWithCurrentTime(selectedDate),
      };

      await expenseService.addExpense(expenseWithTime);
      toast.success("Gasto agregado");
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Error al agregar gasto");
      return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Registro Diario</h1>
        <div className="flex items-center gap-4">
          <label className="text-gray-400">Fecha:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded p-2"
          />
        </div>
      </div>

      <DailyLogForm
        key={`new-entry-${selectedDate}-${Date.now()}`}
        initialData={null}
        onSave={handleSaveLog}
        loading={savingLog}
      />

      <ExpenseForm onAdd={handleAddExpense} selectedDate={selectedDate} />
    </div>
  );
};

export default DailyEntry;
