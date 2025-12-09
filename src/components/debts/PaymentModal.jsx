import React from "react";
import { X } from "lucide-react";
import { PAYMENT_METHODS } from "../../constants";

const PaymentModal = ({ isOpen, onClose, onConfirm, debt }) => {
  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-sm border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">Confirmar Pago</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-6">
            ¿Marcar deuda de{" "}
            <span className="font-bold text-white">S/. {debt.amount}</span> de{" "}
            <span className="font-bold text-white">{debt.customer_name}</span>{" "}
            como pagada?
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onConfirm(debt.id, PAYMENT_METHODS.CASH)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
            >
              EFECTIVO
            </button>
            <button
              onClick={() => onConfirm(debt.id, PAYMENT_METHODS.YAPE)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded transition-colors"
            >
              YAPE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
