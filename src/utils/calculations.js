import { EXPENSE_CATEGORIES } from "../constants";

/**
 * Calcula los totales diarios con la nueva lógica:
 * - Faltante = Total Caja - (Efectivo + Yape + Deudas Pendientes)
 * - Total Final = Total Caja + Amanecidas - Pagos Staff - Varios
 *
 * @param {Array} logs - Registros diarios (contienen total_register, cash_income, yape_income, night_shift_income)
 * @param {Array} expenses - Gastos del día
 * @param {Array} paidDebts - Deudas PAGADAS en el día de creación (se suman a efectivo/yape)
 * @param {Array} pendingDebts - Deudas PENDING creadas ese día (para calcular faltante)
 */
export const calculateDailyTotals = (
  logs = [],
  expenses = [],
  paidDebts = [],
  pendingDebts = [],
) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safePaidDebts = Array.isArray(paidDebts) ? paidDebts : [];
  const safePendingDebts = Array.isArray(pendingDebts) ? pendingDebts : [];

  // Sum up all logs for the day
  const cashFromLog = safeLogs.reduce(
    (sum, log) => sum + (log.cash_income || 0),
    0,
  );
  const yapeFromLog = safeLogs.reduce(
    (sum, log) => sum + (log.yape_income || 0),
    0,
  );
  const nightShift = safeLogs.reduce(
    (sum, log) => sum + (log.night_shift_income || 0),
    0,
  );

  // Total Caja (del programa controlador del cyber)
  const totalRegister = safeLogs.reduce(
    (sum, log) => sum + (log.total_register || 0),
    0,
  );

  // Deudas PAGADAS: se distribuyen a efectivo/yape del día de CREACIÓN de la deuda
  const debtsCash = safePaidDebts
    .filter((d) => d.payment_method === "CASH")
    .reduce((sum, d) => sum + d.amount, 0);

  const debtsYape = safePaidDebts
    .filter((d) => d.payment_method === "YAPE")
    .reduce((sum, d) => sum + d.amount, 0);

  // Deudas PENDING del día (para mostrar en columna y calcular faltante)
  const pendingDebtsTotal = safePendingDebts.reduce(
    (sum, d) => sum + d.amount,
    0,
  );

  // Combined Incomes (Efectivo y Yape incluyen deudas pagadas)
  const totalCash = cashFromLog + debtsCash;
  const totalYape = yapeFromLog + debtsYape;

  // Expenses
  const totalExpenses = safeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const staffPayment = safeExpenses
    .filter((e) => e.category === EXPENSE_CATEGORIES.STAFF_PAYMENT)
    .reduce((sum, e) => sum + e.amount, 0);

  const otherExpenses = totalExpenses - staffPayment;

  // NUEVA FÓRMULA: Faltante = Total Caja - (Efectivo + Yape + Deudas Pendientes)
  // Solo calcular si hay un registro de caja
  const shortage =
    totalRegister > 0
      ? totalRegister - (totalCash + totalYape + pendingDebtsTotal)
      : 0;

  // NUEVA FÓRMULA: Total Final = Total Caja + Amanecidas - Pagos Staff - Varios
  const totalFinal = totalRegister + nightShift - staffPayment - otherExpenses;

  // Total Income (para compatibilidad con Dashboard)
  const totalIncome = totalCash + totalYape + nightShift;

  return {
    cashIncome: totalCash,
    yapeIncome: totalYape,
    nightShift,
    totalRegister,
    pendingDebtsTotal,
    shortage,
    staffPayment,
    otherExpenses,
    totalExpenses,
    totalFinal,
    totalIncome,
    debtsCash,
    debtsYape,
  };
};
