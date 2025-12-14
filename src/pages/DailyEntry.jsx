import React, { useState, useEffect, useCallback } from "react";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import DailyLogForm from "../components/daily/DailyLogForm";
import ExpenseForm from "../components/daily/ExpenseForm";
import { useToast } from "../hooks/useToast";
import { useFetch } from "../hooks/useFetch";

const DailyEntry = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  // const [logData, setLogData] = useState(null); // Removed as we don't edit single logs anymore
  const [expenses, setExpenses] = useState([]);
  const [savingLog, setSavingLog] = useState(false);
  const toast = useToast();

  const fetchDailyData = useCallback(async () => {
    const [logs, exp] = await Promise.all([
      logService.getLogsByDate(selectedDate),
      expenseService.getExpensesByDate(selectedDate),
    ]);
    return { logs, exp };
  }, [selectedDate]);

  const { data, refetch } = useFetch(fetchDailyData, [fetchDailyData], {
    errorMessage: "Error al cargar datos diarios",
  });

  useEffect(() => {
    if (data) {
      setExpenses(data.exp || []);
    } else {
      setExpenses([]);
    }
  }, [data]);

  const handleSaveLog = async (formData) => {
    try {
      setSavingLog(true);
      // Always add a new log entry
      await logService.addLog({
        ...formData,
        date: selectedDate,
      });

      toast.success("Registro agregado exitosamente!");
      await refetch();
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Error al guardar registro.");
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await expenseService.addExpense({ ...expense, date: selectedDate });
      await refetch();
      toast.success("Gasto agregado");
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Error al agregar gasto");
      return false;
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      await expenseService.deleteExpense(id);
      await refetch();
      toast.success("Gasto eliminado");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Error al eliminar gasto");
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

      <ExpenseForm
        expenses={expenses}
        onAdd={handleAddExpense}
        onDelete={handleDeleteExpense}
      />
    </div>
  );
};

export default DailyEntry;
