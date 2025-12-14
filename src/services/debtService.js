import { supabase } from "./supabase";
import { DEBT_STATUS } from "../constants";

export const debtService = {
  async getDebts({
    status,
    startDate,
    endDate,
    searchTerm,
    page = 1,
    pageSize = 5,
  } = {}) {
    let query = supabase.from("debts").select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) query = query.gte("created_at", startDate);
    if (endDate) query = query.lte("created_at", endDate);

    if (searchTerm) {
      query = query.ilike("customer_name", `%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getPaidDebtsByMonth(year, month) {
    const startDate = new Date(year, month, 1).toISOString();
    // Get the last moment of the month
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("status", DEBT_STATUS.PAID)
      .gte("paid_at", startDate)
      .lte("paid_at", endDate);

    if (error) throw error;
    return data;
  },

  async addDebt(debt) {
    // If created_at is provided, use it, otherwise default to now (handled by DB or here)
    // But if we pass created_at, we should ensure it's in the correct format.
    // The DB default is now(), but we can override it.

    const { data, error } = await supabase
      .from("debts")
      .insert({
        ...debt,
        status: DEBT_STATUS.PENDING,
        // Ensure created_at is set if passed, otherwise let DB handle it
      })
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
