import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../services/debtService";
import { useToast } from "../hooks/useToast";
import { EXPENSE_CATEGORIES } from "../constants";

const History = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [logs, expenses, paidDebts] = await Promise.all([
          logService.getLogsByMonth(selectedYear, selectedMonth),
          expenseService.getExpensesByMonth(selectedYear, selectedMonth),
          debtService.getPaidDebtsByMonth(selectedYear, selectedMonth),
        ]);

        // Generate all days in the month
        const daysInMonth = new Date(
          selectedYear,
          selectedMonth + 1,
          0
        ).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => {
          const d = new Date(selectedYear, selectedMonth, i + 1);
          return d.toISOString().split("T")[0];
        });

        const data = days.map((date) => {
          const log = logs.find((l) => l.date === date) || {};
          const dayExpenses = expenses.filter((e) => e.date === date);
          // Filter debts paid on this date
          const dayDebts = paidDebts.filter(
            (d) => d.paid_at && d.paid_at.startsWith(date)
          );

          const cashIncome = log.cash_income || 0;
          const yapeIncome = log.yape_income || 0;
          const nightShift = log.night_shift_income || 0;
          const shortage = log.shortage_amount || 0;

          const totalDebts = dayDebts.reduce((sum, d) => sum + d.amount, 0);
          const totalExpenses = dayExpenses.reduce(
            (sum, e) => sum + e.amount,
            0
          );

          // Breakdown expenses
          const staffPayment = dayExpenses
            .filter((e) => e.category === EXPENSE_CATEGORIES.STAFF_PAYMENT)
            .reduce((sum, e) => sum + e.amount, 0);
          const otherExpenses = totalExpenses - staffPayment;

          const netTotal =
            cashIncome +
            yapeIncome +
            nightShift +
            totalDebts -
            (totalExpenses + shortage);

          return {
            date,
            cashIncome,
            yapeIncome,
            nightShift,
            totalDebts,
            staffPayment,
            otherExpenses,
            shortage,
            netTotal,
            hasLog: !!log.id,
          };
        });

        // Filter out days with no activity
        const activeDays = data.filter(
          (d) =>
            d.hasLog ||
            d.totalDebts > 0 ||
            d.staffPayment > 0 ||
            d.otherExpenses > 0
        );

        // Sort descending by date
        setHistoryData(activeDays.reverse());
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Error al cargar historial");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedMonth, selectedYear, toast]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Historial Diario</h1>
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
                <th className="px-4 py-3 text-right text-green-400">
                  Efectivo
                </th>
                <th className="px-4 py-3 text-right text-purple-400">Yape</th>
                <th className="px-4 py-3 text-right text-blue-400">Noche</th>
                <th className="px-4 py-3 text-right text-yellow-400">Deudas</th>
                <th className="px-4 py-3 text-right text-red-400">Personal</th>
                <th className="px-4 py-3 text-right text-red-300">Varios</th>
                <th className="px-4 py-3 text-right text-orange-400">
                  Faltante
                </th>
                <th className="px-4 py-3 text-right font-bold text-white">
                  Total Neto
                </th>
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
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {format(new Date(row.date + "T00:00:00"), "dd MMM, EEE", {
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
                    <td className="px-4 py-3 text-right">
                      {row.totalDebts.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.staffPayment.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.otherExpenses.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.shortage.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        row.netTotal >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      S/. {row.netTotal.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
