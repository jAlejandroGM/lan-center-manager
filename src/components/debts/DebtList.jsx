import React from "react";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { DEBT_STATUS, ROLES, PAYMENT_METHOD_LABELS } from "../../constants";
import { useAuth } from "../../hooks/useAuth";

const DebtList = ({ debts, onPayClick, onCancelClick }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isWorker = user?.role === ROLES.WORKER;
  const canPay = isAdmin || isWorker;

  const getStatusIcon = (status) => {
    switch (status) {
      case DEBT_STATUS.PAID:
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case DEBT_STATUS.CANCELLED:
        return <XCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {debts.map((debt) => (
        <div
          key={debt.id}
          className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-white text-lg">
                {debt.customer_name}
              </span>
              {getStatusIcon(debt.status)}
            </div>
            <div className="text-sm text-gray-400">
              {format(new Date(debt.created_at), "dd/MM/yyyy HH:mm")}
            </div>
            {debt.status === DEBT_STATUS.PAID && (
              <div className="text-xs text-emerald-400 mt-1">
                Pagado vía{" "}
                {PAYMENT_METHOD_LABELS[debt.payment_method] ||
                  debt.payment_method}{" "}
                el {format(new Date(debt.paid_at), "dd/MM HH:mm")}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-xl font-bold text-indigo-400">
              S/. {debt.amount.toFixed(2)}
            </span>

            {debt.status === DEBT_STATUS.PENDING && canPay && (
              <div className="flex gap-2">
                <button
                  onClick={() => onPayClick(debt)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition-colors cursor-pointer"
                >
                  Pagar
                </button>
                {isAdmin && (
                  <button
                    onClick={() => onCancelClick(debt.id)}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-sm rounded transition-colors cursor-pointer"
                  >
                    Anular
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {debts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No se encontraron deudas.
        </div>
      )}
    </div>
  );
};

export default DebtList;
