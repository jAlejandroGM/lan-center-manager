import React from "react";

const MonthYearSelector = ({ selectedMonth, selectedYear, onChange }) => {
  const months = [
    { value: 0, label: "Enero" },
    { value: 1, label: "Febrero" },
    { value: 2, label: "Marzo" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Mayo" },
    { value: 5, label: "Junio" },
    { value: 6, label: "Julio" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Septiembre" },
    { value: 9, label: "Octubre" },
    { value: 10, label: "Noviembre" },
    { value: 11, label: "Diciembre" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

  const handleMonthChange = (e) => {
    onChange(parseInt(e.target.value), selectedYear);
  };

  const handleYearChange = (e) => {
    onChange(selectedMonth, parseInt(e.target.value));
  };

  return (
    <div className="flex gap-2">
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        className="bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={handleYearChange}
        className="bg-gray-700 text-white border border-gray-600 rounded p-2 focus:outline-none focus:border-blue-500"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearSelector;
