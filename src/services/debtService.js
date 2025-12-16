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

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    if (searchTerm) {
      query = query.ilike("customer_name", `%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getPaidDebtsByMonth(year, month) {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .eq("status", DEBT_STATUS.PAID)
      .gte("payment_date", startDate)
      .lte("payment_date", endDate);

    if (error) throw error;
    return data;
  },

  async addDebt(debt, userId) {
    const { data, error } = await supabase
      .from("debts")
      .insert({
        customer_name: debt.customer_name,
        amount: debt.amount,
        date: debt.date,
        status: DEBT_STATUS.PENDING,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id, paymentMethod, paymentDateBusiness, userId) {
    const { data, error } = await supabase
      .from("debts")
      .update({
        status: DEBT_STATUS.PAID,
        payment_date: paymentDateBusiness,
        paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        updated_by: userId,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelDebt(id, userId) {
    const { data, error } = await supabase
      .from("debts")
      .update({
        status: DEBT_STATUS.CANCELLED,
        updated_by: userId,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
