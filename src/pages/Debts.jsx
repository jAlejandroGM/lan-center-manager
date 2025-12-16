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
import DateSelector from "../components/ui/DateSelector";
import {
  getTodayLimaISO,
  isValidActionDate,
  isFutureDate,
  formatDateForDisplay,
  getLimaDateFromISO,
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
    // Validar que no se creen deudas en el futuro
    if (isFutureDate(selectedDate)) {
      const todayLima = getTodayLimaISO();
      toast.error(
        `No puedes crear deudas en el futuro. Hoy es ${formatDateForDisplay(
          todayLima
        )}`
      );
      return false;
    }

    setIsSubmitting(true);
    try {
      // CAMBIO: Enviamos 'date' (Fecha de Trabajo) y dejamos que Supabase ponga 'created_at' (Auditoría)
      await debtService.addDebt(
        {
          ...debtData,
          date: selectedDate,
        },
        user?.id
      );

      invalidateCache("debts_");
      await refetch();
      toast.success("Deuda registrada correctamente");
      return true;
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("No se pudo registrar la deuda");
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
        const todayLima = getTodayLimaISO();
        toast.error(
          `No puedes registrar pagos en el futuro. Hoy es ${formatDateForDisplay(
            todayLima
          )}`
        );
        return;
      }

      // 2. Validar consistencia: Fecha Pago >= Fecha Deuda (Business Date)
      if (selectedDate < selectedDebt.date) {
        toast.error(
          `La fecha de pago (${formatDateForDisplay(
            selectedDate
          )}) no puede ser anterior a la fecha de la deuda (${formatDateForDisplay(
            selectedDebt.date
          )})`
        );
        return;
      }

      await debtService.markAsPaid(id, method, selectedDate, user?.id);
      setIsModalOpen(false);
      setSelectedDebt(null);
      invalidateCache("debts_");
      await refetch();
      toast.success("Pago registrado correctamente");
    } catch (error) {
      console.error("Error paying debt:", error);
      toast.error("No se pudo procesar el pago");
    }
  };

  const handleCancelDebt = async (debt) => {
    if (!window.confirm("¿Estás seguro de que deseas anular esta deuda?"))
      return;
    try {
      await debtService.cancelDebt(debt.id, user?.id);
      invalidateCache("debts_");
      await fetchDebts();
      toast.success("Deuda anulada correctamente");
    } catch (error) {
      console.error("Error cancelling debt:", error);
      toast.error("No se pudo anular la deuda");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const isViewer = user?.role === ROLES.VIEWER;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-white">
          {isViewer ? "Lista de Deudas" : "Gestión de Deudas"}
        </h1>
        {!isViewer && (
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )}
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
