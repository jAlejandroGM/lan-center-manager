import React, { useState } from "react";
import DailyLogForm from "./components/DailyLogForm";
import ExpenseForm from "./components/ExpenseForm";
import DateSelector from "../../components/ui/DateSelector";
import { useAuth } from "../auth/hooks/useAuth";
import { getTodayLimaISO } from "../../lib/dateUtils";
import { useDailyOps } from "./hooks/useDailyOps";

const DailyEntry = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayLimaISO());

  const { addLog, addExpense } = useDailyOps();

  const handleSaveLog = async (formData) => {
    try {
      await addLog.mutateAsync({
        logData: {
          ...formData,
          date: selectedDate,
        },
        userId: user?.id,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAddExpense = async (expense) => {
    try {
      await addExpense.mutateAsync({
        expenseData: {
          ...expense,
          date: selectedDate,
        },
        userId: user?.id,
      });
      return true;
    } catch (error) {
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
        loading={addLog.isPending}
      />

      <ExpenseForm onAdd={handleAddExpense} selectedDate={selectedDate} />
    </div>
  );
};

export default DailyEntry;
