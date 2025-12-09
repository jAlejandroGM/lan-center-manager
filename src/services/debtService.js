import { supabase } from "./supabase";
import { DEBT_STATUS } from "../constants";

export const debtService = {
  async getDebts(status = null) {
    let query = supabase
      .from("debts")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async addDebt(debt) {
    const { data, error } = await supabase
      .from("debts")
      .insert({ ...debt, status: DEBT_STATUS.PENDING })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id, paymentMethod) {
    const { data, error } = await supabase
      .from("debts")
      .update({
        status: DEBT_STATUS.PAID,
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelDebt(id) {
    const { data, error } = await supabase
      .from("debts")
      .update({ status: DEBT_STATUS.CANCELLED })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
