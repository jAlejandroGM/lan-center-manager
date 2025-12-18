import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../../debts/services/debtService";
import { useToast } from "../../../hooks/useToast";

export const DAILY_OPS_KEYS = {
  all: ["daily-ops"],
  logs: () => [...DAILY_OPS_KEYS.all, "logs"],
  log: (date) => [...DAILY_OPS_KEYS.logs(), date],
  expenses: () => [...DAILY_OPS_KEYS.all, "expenses"],
  expense: (date) => [...DAILY_OPS_KEYS.expenses(), date],
  history: (year, month) => [...DAILY_OPS_KEYS.all, "history", year, month],
};

export const useDailyOps = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Queries
  const useDailyLog = (date) =>
    useQuery({
      queryKey: DAILY_OPS_KEYS.log(date),
      queryFn: () => logService.getLogsByDate(date),
    });

  const useDailyExpenses = (date) =>
    useQuery({
      queryKey: DAILY_OPS_KEYS.expense(date),
      queryFn: () => expenseService.getExpensesByDate(date),
    });

  const useMonthlyHistory = (year, month) =>
    useQuery({
      queryKey: DAILY_OPS_KEYS.history(year, month),
      queryFn: async () => {
        const [logs, expenses, paidDebts] = await Promise.all([
          logService.getLogsByMonth(year, month),
          expenseService.getExpensesByMonth(year, month),
          debtService.getPaidDebtsByMonth(year, month),
        ]);
        return { logs, expenses, paidDebts };
      },
    });

  // Mutations
  const addLog = useMutation({
    mutationFn: ({ logData, userId }) => logService.addLog(logData, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: DAILY_OPS_KEYS.log(variables.logData.date),
      });
      queryClient.invalidateQueries({ queryKey: DAILY_OPS_KEYS.history() }); // Invalidate all history
      toast.success("Cierre diario guardado correctamente");
    },
    onError: (error) => {
      console.error("Error saving log:", error);
      toast.error("No se pudo guardar el cierre diario");
    },
  });

  const addExpense = useMutation({
    mutationFn: ({ expenseData, userId }) =>
      expenseService.addExpense(expenseData, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: DAILY_OPS_KEYS.expense(variables.expenseData.date),
      });
      queryClient.invalidateQueries({ queryKey: DAILY_OPS_KEYS.history() });
      toast.success("Gasto registrado correctamente");
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast.error("No se pudo registrar el gasto");
    },
  });

  return {
    useDailyLog,
    useDailyExpenses,
    useMonthlyHistory,
    addLog,
    addExpense,
  };
};
