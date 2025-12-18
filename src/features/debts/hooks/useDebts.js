import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debtService } from "../services/debtService";
import { useToast } from "../../../hooks/useToast";

export const DEBTS_KEYS = {
  all: ["debts"],
  lists: () => [...DEBTS_KEYS.all, "list"],
  list: (filters) => [...DEBTS_KEYS.lists(), filters],
  details: () => [...DEBTS_KEYS.all, "detail"],
  detail: (id) => [...DEBTS_KEYS.details(), id],
};

export const useDebts = (filters = {}) => {
  const {
    page = 1,
    pageSize = 5,
    searchTerm = "",
    status,
    startDate,
    endDate,
  } = filters;

  return useQuery({
    queryKey: DEBTS_KEYS.list(filters),
    queryFn: () =>
      debtService.getDebts({
        page,
        pageSize,
        searchTerm,
        status,
        startDate,
        endDate,
      }),
    keepPreviousData: true, // Useful for pagination
  });
};

export const useDebtMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const addDebt = useMutation({
    mutationFn: ({ debt, userId }) => debtService.addDebt(debt, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.lists() });
      toast.success("Deuda registrada correctamente");
    },
    onError: (error) => {
      console.error("Error adding debt:", error);
      toast.error("Error al registrar la deuda");
    },
  });

  const payDebt = useMutation({
    mutationFn: ({ id, paymentMethod, paymentDate, userId }) =>
      debtService.markAsPaid(id, paymentMethod, paymentDate, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.lists() });
      toast.success("Deuda marcada como pagada");
    },
    onError: (error) => {
      console.error("Error paying debt:", error);
      toast.error("Error al procesar el pago");
    },
  });

  const cancelDebt = useMutation({
    mutationFn: ({ id, userId }) => debtService.cancelDebt(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTS_KEYS.lists() });
      toast.success("Deuda anulada correctamente");
    },
    onError: (error) => {
      console.error("Error cancelling debt:", error);
      toast.error("Error al anular la deuda");
    },
  });

  return {
    addDebt,
    payDebt,
    cancelDebt,
  };
};
