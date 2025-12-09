import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const Toast = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000); // Auto close after 3 seconds

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-gray-800 border-green-500/50",
    error: "bg-gray-800 border-red-500/50",
    info: "bg-gray-800 border-blue-500/50",
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border ${bgColors[type]} min-w-[300px] animate-in slide-in-from-right`}
    >
      {icons[type]}
      <p className="text-white text-sm flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
