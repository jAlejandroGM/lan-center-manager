import { useState, useCallback, useEffect } from "react";
import { debtService } from "../services/debtService";
import DebtForm from "../components/debts/DebtForm";
import DebtList from "../components/debts/DebtList";
import PaymentModal from "../components/debts/PaymentModal";
import MonthYearSelector from "../components/ui/MonthYearSelector";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useFetch, invalidateCache } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import { ROLES } from "../constants";
import { Search, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import {
  getTodayLimaISO,
  combineDateWithCurrentTime,
  isValidActionDate,
  isFutureDate,
} from "../utils/dateUtils";

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Inicializar con la fecha actual de Lima
  const [selectedDate, setSelectedDate] = useState(getTodayLimaISO());

  const [searchInput, setSearchInput] = useState("");

  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  const { user } = useAuth();
  const toast = useToast();

  const canAdd = [ROLES.ADMIN, ROLES.WORKER].includes(user?.role);

  const fetchDebts = useCallback(async () => {
    const { data, count } = await debtService.getDebts({
      searchTerm: debouncedSearchTerm,
      page,
      pageSize,
    });

    setDebts(data);
    setTotalCount(count || 0);
    return data;
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { loading, refetch } = useFetch(fetchDebts, [fetchDebts], {
    errorMessage: "Error al cargar deudas",
    cacheKey: `debts_page_${page}_search_${debouncedSearchTerm}`,
  });

  const handleAddDebt = async (debtData) => {
    setIsSubmitting(true);
    try {
      // Usar la fecha seleccionada combinada con la hora actual
      const dateTimeISO = combineDateWithCurrentTime(selectedDate);

      await debtService.addDebt(
        {
          ...debtData,
          created_at: dateTimeISO,
        },
        user?.id
      ); // Pasar ID de usuario para logs futuros

      invalidateCache("debts_");
      await refetch();
      toast.success("Deuda agregada exitosamente");
      return true;
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("Error al agregar deuda");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayClick = (debt) => {
    // Validación básica: no permitir pagar deudas que "parecen" del futuro lejano
    // Pero confiamos más en la validación al confirmar el pago
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (id, method) => {
    try {
      // 1. Validar que la fecha de trabajo no sea futura
      if (isFutureDate(selectedDate)) {
        toast.error(
          `Error: No se puede registrar un pago en una fecha futura (${selectedDate}).`
        );
        return;
      }

      // 2. Validar consistencia: Fecha Pago >= Fecha Creación
      if (!isValidActionDate(selectedDate, selectedDebt.created_at)) {
        const creationDatePart = selectedDebt.created_at.split("T")[0];
        toast.error(
          `Error de Consistencia: La fecha de pago (${selectedDate}) no puede ser anterior a la creación de la deuda (${creationDatePart}).`
        );
        return;
      }

      await debtService.markAsPaid(id, method, selectedDate, user?.id);
      setIsModalOpen(false);
      setSelectedDebt(null);
      invalidateCache("debts_");
      await refetch();
      toast.success("Deuda marcada como pagada");
    } catch (error) {
      console.error("Error paying debt:", error);
      toast.error("Error al procesar el pago");
    }
  };

  const handleCancelDebt = async (debt) => {
    if (!window.confirm("¿Estás seguro de que deseas anular esta deuda?"))
      return;
    try {
      await debtService.cancelDebt(debt.id, user?.id);
      invalidateCache("debts_");
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
        <div className="flex items-center gap-4">
          <label className="text-gray-400">Fecha de Trabajo:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded p-2"
          />
        </div>
      </div>

      {canAdd && <DebtForm onAdd={handleAddDebt} loading={isSubmitting} />}

      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre de cliente..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 p-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setSearchInput("");
                setPage(1);
              }}
              disabled={!searchInput}
              className={`px-4 rounded transition-colors flex items-center justify-center ${
                searchInput
                  ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
              title="Limpiar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="flex items-center px-4 text-white font-bold">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white cursor-pointer"
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
