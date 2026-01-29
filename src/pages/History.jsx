import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StickyNote } from "lucide-react";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import NoteModal from "../components/ui/NoteModal";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../services/debtService";
import { useFetch } from "../hooks/useFetch";
import { calculateDailyTotals } from "../utils/calculations";

const History = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyData, setHistoryData] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchHistory = useCallback(async () => {
    const [logs, expenses, paidDebts, pendingDebts] = await Promise.all([
      logService.getLogsByMonth(selectedYear, selectedMonth),
      expenseService.getExpensesByMonth(selectedYear, selectedMonth),
      debtService.getPaidDebtsByMonth(selectedYear, selectedMonth),
      debtService.getPendingDebtsByMonth(selectedYear, selectedMonth),
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

      // Deudas PAGADAS: filtrar por fecha de CREACIÓN (date), no de pago
      // El pago se suma al efectivo/yape del día en que se creó la deuda
      const dayPaidDebts = paidDebts.filter((d) => d.date === date);

      // Deudas PENDING: filtrar por fecha de creación para mostrar en columna "Deudas"
      const dayPendingDebts = pendingDebts.filter((d) => d.date === date);

      const totals = calculateDailyTotals(
        dayLogs,
        dayExpenses,
        dayPaidDebts,
        dayPendingDebts,
      );

      const notes = dayLogs
        .map((l) => l.notes)
        .filter((n) => n && n.trim().length > 0)
        .join("\n\n");

      return {
        date,
        ...totals,
        hasLog: dayLogs.length > 0,
        notes,
      };
    });

    // Filter out days with no activity
    const activeDays = data.filter(
      (d) =>
        d.hasLog ||
        d.debtsCash > 0 ||
        d.debtsYape > 0 ||
        d.pendingDebtsTotal > 0 ||
        d.staffPayment > 0 ||
        d.otherExpenses > 0,
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
      pendingDebtsTotal: acc.pendingDebtsTotal + row.pendingDebtsTotal,
      shortage: acc.shortage + row.shortage,
      totalRegister: acc.totalRegister + row.totalRegister,
      nightShift: acc.nightShift + row.nightShift,
      staffPayment: acc.staffPayment + row.staffPayment,
      otherExpenses: acc.otherExpenses + row.otherExpenses,
      totalFinal: acc.totalFinal + row.totalFinal,
    }),
    {
      cashIncome: 0,
      yapeIncome: 0,
      pendingDebtsTotal: 0,
      shortage: 0,
      totalRegister: 0,
      nightShift: 0,
      staffPayment: 0,
      otherExpenses: 0,
      totalFinal: 0,
    },
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
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3 text-right text-emerald-400">
                  Efectivo
                </th>
                <th className="px-3 py-3 text-right text-violet-400">Yape</th>
                <th className="px-3 py-3 text-right text-amber-400">Deudas</th>
                <th className="px-3 py-3 text-right text-rose-400">Faltante</th>
                <th className="px-3 py-3 text-right text-cyan-400">Caja</th>
                <th className="px-3 py-3 text-right text-indigo-400">
                  Amanecidas
                </th>
                <th className="px-3 py-3 text-right text-orange-400">
                  Pagos Staff
                </th>
                <th className="px-3 py-3 text-right text-gray-300">Varios</th>
                <th className="px-3 py-3 text-right font-bold text-white">
                  Total Final
                </th>
                <th className="px-3 py-3 text-right text-amber-300">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center">
                    Cargando...
                  </td>
                </tr>
              ) : historyData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center">
                    No hay registros para este mes.
                  </td>
                </tr>
              ) : (
                historyData.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-750">
                    <td className="px-3 py-3 font-medium text-white whitespace-nowrap capitalize">
                      {format(new Date(row.date + "T00:00:00"), "EEE d", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-3 py-3 text-right text-emerald-400">
                      {row.cashIncome.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-violet-400">
                      {row.yapeIncome.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-amber-400">
                      {row.pendingDebtsTotal.toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-3 text-right ${row.shortage < 0 ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {row.shortage.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-cyan-400">
                      {row.totalRegister.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-indigo-400">
                      {row.nightShift.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-orange-400">
                      {row.staffPayment > 0
                        ? `-${row.staffPayment.toFixed(2)}`
                        : "0.00"}
                    </td>
                    <td className="px-3 py-3 text-right text-gray-300">
                      {row.otherExpenses > 0
                        ? `-${row.otherExpenses.toFixed(2)}`
                        : "0.00"}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-white">
                      S/. {row.totalFinal.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() =>
                          setSelectedNote({ date: row.date, notes: row.notes })
                        }
                        disabled={!row.notes}
                        className="p-1 text-gray-400 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer inline-block"
                        title={row.notes ? "Ver notas" : "Sin notas"}
                      >
                        <StickyNote className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {/* Footer Row with Totals */}
              {!loading && historyData.length > 0 && (
                <tr className="bg-gray-900 font-bold border-t-2 border-gray-600">
                  <td className="px-3 py-3 text-white">TOTALES</td>
                  <td className="px-3 py-3 text-right text-emerald-400">
                    {totals.cashIncome.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-violet-400">
                    {totals.yapeIncome.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-amber-400">
                    {totals.pendingDebtsTotal.toFixed(2)}
                  </td>
                  <td
                    className={`px-3 py-3 text-right ${totals.shortage < 0 ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    {totals.shortage.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-cyan-400">
                    {totals.totalRegister.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-indigo-400">
                    {totals.nightShift.toFixed(2)}
                  </td>
                  <td className="px-3 py-3 text-right text-orange-400">
                    {totals.staffPayment > 0
                      ? `-${totals.staffPayment.toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-300">
                    {totals.otherExpenses > 0
                      ? `-${totals.otherExpenses.toFixed(2)}`
                      : "0.00"}
                  </td>
                  <td className="px-3 py-3 text-right text-white">
                    S/. {totals.totalFinal.toFixed(2)}
                  </td>
                  <td className="px-3 py-3"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NoteModal
        isOpen={!!selectedNote}
        onClose={() => setSelectedNote(null)}
        date={selectedNote?.date}
        notes={selectedNote?.notes}
      />
    </div>
  );
};

export default History;
