import { supabase } from "./supabase";
import { DEBT_STATUS } from "../constants";
import { combineDateWithCurrentTime } from "../utils/dateUtils";

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
    // userId param prepared for future audit logs
    const { data, error } = await supabase
      .from("debts")
      .insert({
        ...debt,
        status: DEBT_STATUS.PENDING,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id, paymentMethod, paymentDate) {
    // userId param prepared for future audit logs

    // Usamos la utilidad centralizada para combinar la fecha elegida con la hora actual de Lima
    const dateToSave = combineDateWithCurrentTime(paymentDate);

    const { data, error } = await supabase
      .from("debts")
      .update({
        status: DEBT_STATUS.PAID,
        paid_at: dateToSave,
        payment_method: paymentMethod,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelDebt(id) {
    // userId param prepared for future audit logs
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
