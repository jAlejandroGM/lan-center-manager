import { useState } from "react";
import DebtForm from "./components/DebtForm";
import DebtList from "./components/DebtList";
import PaymentModal from "./components/PaymentModal";
import { useAuth } from "../auth/hooks/useAuth";
import { useDebounce } from "../../hooks/useDebounce";
import { ROLES } from "../../config/constants";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import DateSelector from "../../components/ui/DateSelector";
import {
  getTodayLimaISO,
  isFutureDate,
  formatDateForDisplay,
} from "../../lib/dateUtils";
import { useDebts, useDebtMutations } from "./hooks/useDebts";
import { useToast } from "../../hooks/useToast";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const Debts = () => {
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayLimaISO());
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 5;
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const { user } = useAuth();
  const toast = useToast();

  const canAdd = [ROLES.ADMIN, ROLES.WORKER].includes(user?.role);

  // React Query Hooks
  const { data, isLoading, isError } = useDebts({
    searchTerm: debouncedSearchTerm,
    page,
    pageSize,
  });

  const { addDebt, payDebt, cancelDebt } = useDebtMutations();

  const debts = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Manejo de búsqueda sin useEffect
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1); // Reset page immediately on user interaction
  };

  const handleAddDebt = async (debtData) => {
    if (isFutureDate(selectedDate)) {
      const todayLima = getTodayLimaISO();
      toast.error(
        `No puedes crear deudas en el futuro. Hoy es ${formatDateForDisplay(
          todayLima
        )}`
      );
      return false;
    }

    try {
      await addDebt.mutateAsync({
        debt: {
          ...debtData,
          date: selectedDate,
        },
        userId: user?.id,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handlePayClick = (debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async (paymentMethod) => {
    if (!selectedDebt) return;

    try {
      await payDebt.mutateAsync({
        id: selectedDebt.id,
        paymentMethod,
        paymentDate: selectedDate,
        userId: user?.id,
      });
      setIsModalOpen(false);
      setSelectedDebt(null);
    } catch (error) {
      console.error(error);
      // Error handled by mutation
    }
  };

  const handleCancelClick = async (debt) => {
    if (
      window.confirm(
        `¿Estás seguro de anular la deuda de ${debt.customer_name}?`
      )
    ) {
      try {
        await cancelDebt.mutateAsync({
          id: debt.id,
          userId: user?.id,
        });
      } catch (error) {
        console.error(error);
        // Error handled by mutation
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Gestión de Deudas
          </h1>
          <p className="text-gray-400">
            Registra y controla las deudas de los clientes
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      </div>

      {canAdd && <DebtForm onAdd={handleAddDebt} loading={addDebt.isPending} />}

      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar cliente..."
              value={searchInput}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-400">
            Total registros:{" "}
            <span className="text-white font-medium">{totalCount}</span>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-400">
              Error al cargar las deudas. Por favor intenta de nuevo.
            </div>
          ) : debts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No se encontraron deudas registradas
            </div>
          ) : (
            <>
              <DebtList
                debts={debts}
                onPayClick={handlePayClick}
                onCancelClick={handleCancelClick}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-gray-700">
                  <Button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    variant="secondary"
                    className="p-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-gray-300">
                    Página{" "}
                    <span className="text-white font-medium">{page}</span> de{" "}
                    <span className="text-white font-medium">{totalPages}</span>
                  </span>
                  <Button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    variant="secondary"
                    className="p-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDebt(null);
        }}
        onConfirm={handleConfirmPayment}
        debt={selectedDebt}
      />
    </div>
  );
};

export default Debts;
