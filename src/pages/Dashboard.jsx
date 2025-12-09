import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { logService } from "../services/logService";
import { expenseService } from "../services/expenseService";
import { debtService } from "../services/debtService";
import { DEBT_STATUS } from "../constants";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    cashIncome: 0,
    yapeIncome: 0,
    nightShift: 0,
    debtsPaid: 0,
    expenses: 0,
    shortage: 0,
    netTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [log, expenses, allDebts] = await Promise.all([
          logService.getLogByDate(today).catch(() => null),
          expenseService.getExpensesByDate(today),
          debtService.getDebts(), // We need to filter paid today
        ]);

        // Calculate Debts Paid Today
        // Note: In a real app, we should filter by date in the query, but for now we filter in JS
        const debtsPaidToday = allDebts
          .filter(
            (d) =>
              d.status === DEBT_STATUS.PAID &&
              d.paid_at &&
              d.paid_at.startsWith(today)
          )
          .reduce((sum, d) => sum + d.amount, 0);

        // Calculate Expenses
        const totalExpenses = (expenses || []).reduce(
          (sum, e) => sum + e.amount,
          0
        );

        // Log Data
        const cashIncome = log?.cash_income || 0;
        const yapeIncome = log?.yape_income || 0;
        const nightShift = log?.night_shift_income || 0;
        const shortage = log?.shortage_amount || 0;

        // Net Total Formula
        // Total = (cash + yape + night + debts_paid) - (expenses + shortage)
        const totalIncome =
          cashIncome + yapeIncome + nightShift + debtsPaidToday;
        const totalOutflow = totalExpenses + shortage;
        const netTotal = totalIncome - totalOutflow;

        setMetrics({
          cashIncome,
          yapeIncome,
          nightShift,
          debtsPaid: debtsPaidToday,
          expenses: totalExpenses,
          shortage,
          netTotal,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [today]);

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
            "text-opacity-80 "
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-right">
          <p className="text-gray-400">Today's Overview</p>
          <p className="text-xl font-bold text-white">
            {format(new Date(), "EEEE, dd MMMM")}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white">Loading metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Net Total"
            value={metrics.netTotal}
            icon={DollarSign}
            color="text-green-400"
            subtext="Final balance after expenses"
          />
          <MetricCard
            title="Total Expenses"
            value={metrics.expenses}
            icon={TrendingDown}
            color="text-red-400"
          />
          <MetricCard
            title="Debts Collected"
            value={metrics.debtsPaid}
            icon={TrendingUp}
            color="text-blue-400"
          />
          <MetricCard
            title="Shortage"
            value={metrics.shortage}
            icon={AlertCircle}
            color="text-yellow-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">
            Income Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Cash Income</span>
              <span className="text-white font-bold">
                S/. {metrics.cashIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Yape Income</span>
              <span className="text-white font-bold">
                S/. {metrics.yapeIncome.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="text-gray-300">Night Shift</span>
              <span className="text-white font-bold">
                S/. {metrics.nightShift.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-300">Debts Recovered</span>
              <span className="text-white font-bold">
                S/. {metrics.debtsPaid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
          <p className="text-gray-400">
            This dashboard reflects the current day's operations. Ensure all
            expenses and debts are logged correctly for an accurate Net Total.
          </p>
          <div className="mt-6 p-4 bg-blue-900/20 rounded border border-blue-800">
            <p className="text-sm text-blue-300">
              <strong>Tip:</strong> Use the "Daily Entry" page to log the final
              cash count at the end of the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
