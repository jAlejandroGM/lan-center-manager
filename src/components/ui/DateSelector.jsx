import React from "react";
import { CalendarClock } from "lucide-react";
import { getTodayLimaISO } from "../../utils/dateUtils";

/**
 * DateSelector Component
 *
 * Componente estandarizado para la selección de "Fecha de Trabajo" (Business Date).
 * Incluye botón de sincronización rápida con la fecha actual de Perú.
 *
 * @param {string} selectedDate - Fecha en formato YYYY-MM-DD
 * @param {function} onDateChange - Función para actualizar la fecha
 */
const DateSelector = ({ selectedDate, onDateChange }) => {
  const handleSync = () => {
    const today = getTodayLimaISO();
    onDateChange(today);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="text-gray-400 hidden sm:block">
        Fecha para el registro:
      </label>
      <div className="flex gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-gray-700 text-white border border-gray-600 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSync}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded border border-gray-600 transition-colors group relative"
          title="Sincronizar con Hoy (Perú)"
          type="button"
        >
          <CalendarClock className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
        </button>
      </div>
    </div>
  );
};

export default DateSelector;
