import React, { useState } from "react";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import DailyLogForm from "../components/daily/DailyLogForm";
import ExpenseForm from "../components/daily/ExpenseForm";
import DateSelector from "../components/ui/DateSelector";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { getTodayLimaISO } from "../utils/dateUtils";

const DailyEntry = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayLimaISO());
  const [savingLog, setSavingLog] = useState(false);
  const toast = useToast();

  const handleSaveLog = async (formData) => {
    try {
      setSavingLog(true);
      await logService.addLog(
        {
          ...formData,
          date: selectedDate,
        },
        user?.id
      );

      toast.success("Cierre diario guardado correctamente");
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("No se pudo guardar el cierre diario. Inténtalo de nuevo");
    } finally {
      setSavingLog(false);
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      // CORRECCIÓN: Separación de Tiempo de Trabajo vs Tiempo del Sistema
      // 'date': Fecha de Trabajo (seleccionada por usuario)
      // 'created_at': Tiempo del Sistema (automático por Supabase)
      // Eliminamos la sobrescritura de created_at para mantener el log de auditoría real.
      const expenseData = {
        ...expense,
        date: selectedDate,
        // created_at: NO LO ENVIAMOS. Dejamos que Supabase ponga now()
      };

      await expenseService.addExpense(expenseData, user?.id);
      toast.success("Gasto registrado correctamente");
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("No se pudo registrar el gasto");
      return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Registro Diario</h1>
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          label="Fecha de Registro:"
        />
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
