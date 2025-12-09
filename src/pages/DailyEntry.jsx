import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import DailyLogForm from "../components/daily/DailyLogForm";
import ExpenseForm from "../components/daily/ExpenseForm";
import { useToast } from "../hooks/useToast";
import { useFetch } from "../hooks/useFetch";

const DailyEntry = () => {
  const [logData, setLogData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [savingLog, setSavingLog] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const toast = useToast();

  const fetchDailyData = useCallback(async () => {
    const [log, exp] = await Promise.all([
      logService.getLogByDate(today).catch(() => null), // Ignore 404
      expenseService.getExpensesByDate(today),
    ]);
    return { log, exp };
  }, [today]);

  const { data, refetch } = useFetch(fetchDailyData, [fetchDailyData], {
    errorMessage: "Error al cargar datos diarios",
  });

  useEffect(() => {
    if (data) {
      if (data.log) setLogData(data.log);
      setExpenses(data.exp || []);
    }
  }, [data]);

  const handleSaveLog = async (data) => {
    try {
      setSavingLog(true);
      const savedLog = await logService.upsertLog({ ...data, date: today });
      setLogData(savedLog);
      toast.success("Registro diario guardado exitosamente!");
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Error al guardar registro.");
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await expenseService.addExpense(expense);
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
        <div className="text-gray-400 font-mono text-lg">
          {format(new Date(), "dd/MM/yyyy")}
        </div>
      </div>

      <DailyLogForm
        key={logData ? logData.id : "new"}
        initialData={logData}
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
