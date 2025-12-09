import { useState, useEffect } from "react";
import { debtService } from "../services/debtService";
import DebtForm from "../components/debts/DebtForm";
import DebtList from "../components/debts/DebtList";
import PaymentModal from "../components/debts/PaymentModal";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ROLES } from "../constants";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const { user } = useAuth();
  const toast = useToast();

  const canAdd = [ROLES.ADMIN, ROLES.WORKER].includes(user?.role);

  const fetchDebts = async () => {
    try {
      setLoading(true);

      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString();
      const endDate = new Date(
        selectedYear,
        selectedMonth + 1,
        0,
        23,
        59,
        59
      ).toISOString();

      const { data, count } = await debtService.getDebts({
        startDate,
        endDate,
        searchTerm,
        page,
        pageSize,
      });

      setDebts(data);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching debts:", error);
      toast.error("Error al cargar deudas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear, searchTerm, page]);

  const handleAddDebt = async (debtData) => {
    try {
      setLoading(true);
      await debtService.addDebt(debtData);
      await fetchDebts();
      toast.success("Deuda agregada exitosamente");
      return true;
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("Error al agregar deuda");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (id, method) => {
    try {
      await debtService.markAsPaid(id, method);
      setIsModalOpen(false);
      setSelectedDebt(null);
      await fetchDebts();
      toast.success("Deuda marcada como pagada");
    } catch (error) {
      console.error("Error paying debt:", error);
      toast.error("Error al procesar el pago");
    }
  };

  const handleCancelDebt = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas anular esta deuda?"))
      return;
    try {
      await debtService.cancelDebt(id);
      await fetchDebts();
      toast.success("Deuda anulada");
    } catch (error) {
      console.error("Error cancelling debt:", error);
      toast.error("Error al anular deuda");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">Gestión de Deudas</h1>
        <MonthYearSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
            setPage(1); // Reset page on date change
          }}
        />
      </div>

      {canAdd && <DebtForm onAdd={handleAddDebt} loading={loading} />}

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // Reset page on search
            }}
            className="w-full pl-10 p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <DebtList
        debts={debts}
        onPayClick={handlePayClick}
        onCancelClick={handleCancelDebt}
      />

      {/* Pagination Controls */}
      {totalCount > 0 && (
        <div className="flex justify-between items-center mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <span className="text-gray-400 text-sm">
            Mostrando {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, totalCount)} de {totalCount}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="flex items-center px-4 text-white font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmPayment}
        debt={selectedDebt}
      />
    </div>
  );
};

export default Debts;
