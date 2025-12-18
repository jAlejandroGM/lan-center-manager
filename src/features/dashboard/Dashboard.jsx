import { useState } from "react";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import { DollarSign, TrendingDown, AlertCircle, Loader2 } from "lucide-react";
import { useDashboardMetrics } from "./hooks/useDashboardMetrics";
import { Card } from "../../components/ui/Card";

const MetricCard = ({ title, value, Icon, color, subtext }) => (
  <Card className="p-6">
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
          "text-opacity-80 "
        )}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
  </Card>
);

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { metrics, isLoading, isError } = useDashboardMetrics(
    selectedYear,
    selectedMonth
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

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : isError ? (
        <Card className="text-center py-20 text-red-400 border-red-900">
          <AlertCircle className="w-10 h-10 mx-auto mb-2" />
          <p>Error al cargar las métricas. Por favor intenta de nuevo.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Ingresos"
              value={metrics.totalIncome}
              Icon={DollarSign}
              color="text-emerald-400"
              subtext="Efectivo + Yape + Amanecidas + Deudas pagadas"
            />
            <MetricCard
              title="Total Gastos"
              value={metrics.expenses}
              Icon={TrendingDown}
              color="text-yellow-400"
              subtext="Pagos al Staff + Gatos en Suministros"
            />
            <MetricCard
              title="Dinero Faltante"
              value={metrics.shortage}
              Icon={AlertCircle}
              color="text-rose-400"
              subtext="Descuadre de caja sin justificación"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Desglose de Ingresos
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">Efectivo</span>
                  <span className="text-white font-bold">
                    S/. {metrics.cashIncome.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <span className="text-gray-300">Yape</span>
                  <span className="text-white font-bold">
                    S/. {metrics.yapeIncome.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Amanecidas</span>
                  <span className="text-white font-bold">
                    S/. {metrics.nightShift.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Estado del Sistema
              </h3>
              <p className="text-gray-400">
                Este panel refleja las operaciones del{" "}
                <strong>mes seleccionado</strong>. Asegúrate de registrar
                correctamente todos los gastos y deudas para obtener un Total
                Neto preciso.
              </p>
              <div className="mt-6 p-4 bg-indigo-900/20 rounded border border-indigo-800">
                <p className="text-sm text-indigo-300">
                  <strong>Consejo:</strong> Usa la página 'Historial' para ver
                  el detalle día por día.
                </p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
