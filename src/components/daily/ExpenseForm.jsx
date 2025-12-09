import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../../constants";

const ExpenseForm = ({ expenses, onAdd, onDelete }) => {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES.OTHER);
  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    onAdd({
      category,
      beneficiary,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString().split("T")[0],
    });

    setBeneficiary("");
    setAmount("");
    setDescription("");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Expenses</h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
        >
          {Object.values(EXPENSE_CATEGORIES).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Beneficiary (Optional)"
          value={beneficiary}
          onChange={(e) => setBeneficiary(e.target.value)}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
        />

        <input
          type="number"
          placeholder="Amount (S/.)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
          step="0.10"
          required
        />

        <input
          type="text"
          placeholder="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 bg-gray-700 border border-gray-600 rounded text-white"
        />

        <button
          type="submit"
          className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </form>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="flex justify-between items-center bg-gray-700 p-3 rounded"
          >
            <div>
              <div className="font-bold text-white">{expense.category}</div>
              <div className="text-sm text-gray-400">
                {expense.beneficiary && `${expense.beneficiary} - `}
                {expense.description}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-red-400">
                - S/. {expense.amount.toFixed(2)}
              </span>
              <button
                onClick={() => onDelete(expense.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="text-gray-500 text-center">
            No expenses recorded today.
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseForm;
