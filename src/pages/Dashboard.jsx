import { useState, useEffect } from "react";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../services/debtService";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import {
  DollarSign,
  TrendingDown,
  AlertCircle,
  Calculator,
} from "lucide-react";

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [metrics, setMetrics] = useState({
    cashIncome: 0,
    yapeIncome: 0,
    nightShift: 0,
    expenses: 0,
    shortage: 0,
    totalRegister: 0,
    pendingDebtsTotal: 0,
    totalFinal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [logs, expenses, paidDebts, pendingDebts] = await Promise.all([
          logService.getLogsByMonth(selectedYear, selectedMonth),
          expenseService.getExpensesByMonth(selectedYear, selectedMonth),
          debtService.getPaidDebtsByMonth(selectedYear, selectedMonth),
          debtService.getPendingDebtsByMonth(selectedYear, selectedMonth),
        ]);

        const cashFromLogs = logs.reduce(
          (sum, log) => sum + (log.cash_income || 0),
          0,
        );
        const yapeFromLogs = logs.reduce(
          (sum, log) => sum + (log.yape_income || 0),
          0,
        );
        const nightShift = logs.reduce(
          (sum, log) => sum + (log.night_shift_income || 0),
          0,
        );
        const totalRegister = logs.reduce(
          (sum, log) => sum + (log.total_register || 0),
          0,
        );

        // 2. Sum from Debts (distributed by method)
        const debtsCash = paidDebts
          .filter((d) => d.payment_method === "CASH")
          .reduce((sum, d) => sum + d.amount, 0);

        const debtsYape = paidDebts
          .filter((d) => d.payment_method === "YAPE")
          .reduce((sum, d) => sum + d.amount, 0);

        // Deudas pendientes del mes
        const pendingDebtsTotal = pendingDebts.reduce(
          (sum, d) => sum + d.amount,
          0,
        );

        // 3. Sum Expenses
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Separar por categoría
        const staffPayment = expenses
          .filter((e) => e.category === "STAFF_PAYMENT")
          .reduce((sum, e) => sum + e.amount, 0);
        const otherExpenses = totalExpenses - staffPayment;

        // 4. Combined Totals
        const cashIncome = cashFromLogs + debtsCash;
        const yapeIncome = yapeFromLogs + debtsYape;

        // Nueva fórmula: Faltante = Total Caja - (Efectivo + Yape + Deudas Pendientes)
        const shortage =
          totalRegister > 0
            ? totalRegister - (cashIncome + yapeIncome + pendingDebtsTotal)
            : 0;

        // Nueva fórmula: Total Final = Total Caja + Amanecidas - Pagos Staff - Varios
        const totalFinal =
          totalRegister + nightShift - staffPayment - otherExpenses;

        setMetrics({
          cashIncome,
          yapeIncome,
          nightShift,
          expenses: totalExpenses,
          shortage,
          totalRegister,
          pendingDebtsTotal,
          totalFinal,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // eslint-disable-next-line no-unused-vars
  const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h3 className={`text-2xl font-bold ${color}`}>
            S/. {value.toFixed(2)}
          </h3>
        </div>
        <div
          className={`p-3 rounded-full bg-gray-700 ${color.replace(
            "text-",
            "text-opacity-80 ",
          )}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Panel Principal</h1>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Resumen Mensual</p>
          </div>
          <MonthYearSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white">Cargando métricas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Caja"
            value={metrics.totalRegister}
            icon={Calculator}
            color="text-cyan-400"
            subtext="Registrado en el programa del cyber"
          />
          <MetricCard
            title="Total Final"
            value={metrics.totalFinal}
            icon={DollarSign}
            color="text-emerald-400"
            subtext="Caja + Amanecidas - Staff - Varios"
          />
          <MetricCard
            title="Total Gastos"
            value={metrics.expenses}
            icon={TrendingDown}
            color="text-yellow-400"
            subtext="Pagos al Staff + Gastos en Suministros"
          />
          <MetricCard
            title="Dinero Faltante"
            value={metrics.shortage}
            icon={AlertCircle}
            color="text-rose-400"
            subtext="Caja - (Efectivo + Yape + Deudas)"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">
            Desglose de Ingresos
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Efectivo</span>
              <span className="text-emerald-400 font-bold">
                S/. {metrics.cashIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Yape</span>
              <span className="text-violet-400 font-bold">
                S/. {metrics.yapeIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Deudas Pendientes</span>
              <span className="text-amber-400 font-bold">
                S/. {metrics.pendingDebtsTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Amanecidas</span>
              <span className="text-indigo-400 font-bold">
                S/. {metrics.nightShift.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center justify-center">
          <p className="text-sm text-indigo-300 text-center">
            <strong>Nota:</strong> Las deudas pagadas se suman automáticamente
            al Efectivo o Yape del día en que fueron creadas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
