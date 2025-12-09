import { useState, useEffect } from "react";
import { debtService } from "../services/debtService";
import DebtForm from "../components/debts/DebtForm";
import DebtList from "../components/debts/DebtList";
import PaymentModal from "../components/debts/PaymentModal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { ROLES } from "../constants";

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const canAdd = [ROLES.ADMIN, ROLES.WORKER].includes(user?.role);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await debtService.getDebts();
      setDebts(data);
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
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Gestión de Deudas</h1>

      {canAdd && <DebtForm onAdd={handleAddDebt} loading={loading} />}

      <DebtList
        debts={debts}
        onPayClick={handlePayClick}
        onCancelClick={handleCancelDebt}
      />

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
