import { useMemo } from "react";
import { useDailyOps } from "../../daily-ops/hooks/useDailyOps";

export const useDashboardMetrics = (year, month) => {
  const { useMonthlyHistory } = useDailyOps();

  // Fetch monthly history (logs, expenses, paid debts)
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
  } = useMonthlyHistory(year, month);

  // Fetch pending debts (optional, but good for dashboard context)
  // Note: useDebts currently fetches paginated data.
  // For a dashboard summary of ALL pending debts, we might need a different query or just show the count from the first page.
  // For now, we will focus on the metrics derived from history (Income/Expenses) as per the current Dashboard.jsx

  const metrics = useMemo(() => {
    if (!historyData) {
      return {
        cashIncome: 0,
        yapeIncome: 0,
        nightShift: 0,
        expenses: 0,
        shortage: 0,
        totalIncome: 0,
        netProfit: 0,
      };
    }

    const { logs, expenses, paidDebts } = historyData;

    // 1. Sum from Logs
    const cashFromLogs = logs.reduce(
      (sum, log) => sum + (log.cash_income || 0),
      0
    );
    const yapeFromLogs = logs.reduce(
      (sum, log) => sum + (log.yape_income || 0),
      0
    );
    const nightShift = logs.reduce(
      (sum, log) => sum + (log.night_shift_income || 0),
      0
    );
    const shortage = logs.reduce(
      (sum, log) => sum + (log.shortage_amount || 0),
      0
    );

    // 2. Sum from Debts (distributed by method)
    const debtsCash = paidDebts
      .filter((d) => d.payment_method === "CASH")
      .reduce((sum, d) => sum + d.amount, 0);

    const debtsYape = paidDebts
      .filter((d) => d.payment_method === "YAPE")
      .reduce((sum, d) => sum + d.amount, 0);

    // 3. Sum Expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // 4. Combined Totals
    const cashIncome = cashFromLogs + debtsCash;
    const yapeIncome = yapeFromLogs + debtsYape;
    const totalIncome = cashIncome + yapeIncome + nightShift;
    const netProfit = totalIncome - totalExpenses;

    return {
      cashIncome,
      yapeIncome,
      nightShift,
      expenses: totalExpenses,
      shortage,
      totalIncome,
      netProfit,
    };
  }, [historyData]);

  return {
    metrics,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
  };
};
