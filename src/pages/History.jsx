import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../services/debtService";
import { useFetch } from "../hooks/useFetch";
import { calculateDailyTotals } from "../utils/calculations";

const History = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyData, setHistoryData] = useState([]);

  const fetchHistory = useCallback(async () => {
    const [logs, expenses, paidDebts] = await Promise.all([
      logService.getLogsByMonth(selectedYear, selectedMonth),
      expenseService.getExpensesByMonth(selectedYear, selectedMonth),
      debtService.getPaidDebtsByMonth(selectedYear, selectedMonth),
    ]);

    // Generate all days in the month
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(selectedYear, selectedMonth, i + 1);
      return d.toISOString().split("T")[0];
    });

    const data = days.map((date) => {
      // Filter logs for this specific date
      const dayLogs = logs.filter((l) => l.date === date);
      const dayExpenses = expenses.filter((e) => e.date === date);
      const dayDebts = paidDebts.filter(
        (d) => d.paid_at && d.paid_at.startsWith(date)
      );

      const totals = calculateDailyTotals(dayLogs, dayExpenses, dayDebts);

      return {
        date,
        ...totals,
        hasLog: dayLogs.length > 0,
      };
    });

    // Filter out days with no activity
    const activeDays = data.filter(
      (d) =>
        d.hasLog ||
        d.debtsCash > 0 ||
        d.debtsYape > 0 ||
        d.staffPayment > 0 ||
        d.otherExpenses > 0
    );

    // Sort descending by date
    setHistoryData(activeDays.reverse());
    return activeDays;
  }, [selectedMonth, selectedYear]);

  const { loading } = useFetch(fetchHistory, [fetchHistory], {
    errorMessage: "Error al cargar historial",
  });

  // Calculate Column Totals
  const totals = historyData.reduce(
    (acc, row) => ({
      cashIncome: acc.cashIncome + row.cashIncome,
      yapeIncome: acc.yapeIncome + row.yapeIncome,
      nightShift: acc.nightShift + row.nightShift,
      totalIncome: acc.totalIncome + row.totalIncome,
      staffPayment: acc.staffPayment + row.staffPayment,
      otherExpenses: acc.otherExpenses + row.otherExpenses,
      shortage: acc.shortage + row.shortage,
    }),
    {
      cashIncome: 0,
      yapeIncome: 0,
      nightShift: 0,
      totalIncome: 0,
      staffPayment: 0,
      otherExpenses: 0,
      shortage: 0,
    }
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Historial Mensual</h1>
        <MonthYearSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right text-emerald-400">
                  Efectivo
                </th>
                <th className="px-4 py-3 text-right text-violet-400">Yape</th>
                <th className="px-4 py-3 text-right text-indigo-400">
                  Amanecida
                </th>
                <th className="px-4 py-3 text-right font-bold text-white">
                  Total
                </th>
                <th className="px-4 py-3 text-right text-rose-400">Faltante</th>
                <th className="px-4 py-3 text-right text-orange-400">
                  Pagos Staff
                </th>
                <th className="px-4 py-3 text-right text-gray-300">Varios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : historyData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center">
                    No hay registros para este mes.
                  </td>
                </tr>
              ) : (
                historyData.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-750">
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap capitalize">
                      {format(new Date(row.date + "T00:00:00"), "EEEE d", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.cashIncome.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.yapeIncome.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.nightShift.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      S/. {row.totalIncome.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-rose-400">
                      {row.shortage.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-orange-400">
                      {row.staffPayment.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {row.otherExpenses.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
              {/* Footer Row with Totals */}
              {!loading && historyData.length > 0 && (
                <tr className="bg-gray-900 font-bold border-t-2 border-gray-600">
                  <td className="px-4 py-3 text-white">TOTALES</td>
                  <td className="px-4 py-3 text-right text-emerald-400">
                    {totals.cashIncome.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-violet-400">
                    {totals.yapeIncome.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-indigo-400">
                    {totals.nightShift.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    S/. {totals.totalIncome.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-400">
                    {totals.shortage.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-400">
                    {totals.staffPayment.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {totals.otherExpenses.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
