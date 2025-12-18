import { EXPENSE_CATEGORIES } from "../config/constants";

export const calculateDailyTotals = (
  logs = [],
  expenses = [],
  paidDebts = []
) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safePaidDebts = Array.isArray(paidDebts) ? paidDebts : [];

  // Sum up all logs for the day
  const cashFromLog = safeLogs.reduce(
    (sum, log) => sum + (log.cash_income || 0),
    0
  );
  const yapeFromLog = safeLogs.reduce(
    (sum, log) => sum + (log.yape_income || 0),
    0
  );
  const nightShift = safeLogs.reduce(
    (sum, log) => sum + (log.night_shift_income || 0),
    0
  );
  const shortage = safeLogs.reduce(
    (sum, log) => sum + (log.shortage_amount || 0),
    0
  );

  // Distribute debt payments
  const debtsCash = safePaidDebts
    .filter((d) => d.payment_method === "CASH")
    .reduce((sum, d) => sum + d.amount, 0);

  const debtsYape = safePaidDebts
    .filter((d) => d.payment_method === "YAPE")
    .reduce((sum, d) => sum + d.amount, 0);

  // Combined Incomes
  const totalCash = cashFromLog + debtsCash;
  const totalYape = yapeFromLog + debtsYape;

  // Total Income (Gross)
  const totalIncome = totalCash + totalYape + nightShift;

  // Expenses
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const staffPayment = safeExpenses
    .filter((e) => e.category === EXPENSE_CATEGORIES.STAFF_PAYMENT)
    .reduce((sum, e) => sum + e.amount, 0);

  const otherExpenses = totalExpenses - staffPayment;

  return {
    cashIncome: totalCash,
    yapeIncome: totalYape,
    nightShift,
    totalIncome,
    staffPayment,
    otherExpenses,
    shortage,
    totalExpenses,
    debtsCash,
    debtsYape,
  };
};
