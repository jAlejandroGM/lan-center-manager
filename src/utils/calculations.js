import { EXPENSE_CATEGORIES } from "../constants";

export const calculateDailyTotals = (
  log = {},
  expenses = [],
  paidDebts = []
) => {
  const safeLog = log || {};
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safePaidDebts = Array.isArray(paidDebts) ? paidDebts : [];

  const cashFromLog = safeLog.cash_income || 0;
  const yapeFromLog = safeLog.yape_income || 0;
  const nightShift = safeLog.night_shift_income || 0;
  const shortage = safeLog.shortage_amount || 0;

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
