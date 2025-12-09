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
      toast.error("Failed to load debts");
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
      toast.success("Debt added successfully");
    } catch (error) {
      console.error("Error adding debt:", error);
      toast.error("Failed to add debt");
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
      toast.success("Debt marked as paid");
    } catch (error) {
      console.error("Error paying debt:", error);
      toast.error("Failed to process payment");
    }
  };

  const handleCancelDebt = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this debt?")) return;
    try {
      await debtService.cancelDebt(id);
      await fetchDebts();
      toast.success("Debt cancelled");
    } catch (error) {
      console.error("Error cancelling debt:", error);
      toast.error("Failed to cancel debt");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Debt Management</h1>

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
