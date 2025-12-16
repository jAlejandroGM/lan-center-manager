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

    if (startDate) query = query.gte("date", startDate);
    if (endDate) query = query.lte("date", endDate);

    if (searchTerm) {
      query = query.ilike("customer_name", `%${searchTerm}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Ordenamos por fecha de creación real (auditoría) para ver lo último agregado primero
    // Opcionalmente podríamos ordenar por 'date' si el negocio lo prefiere
    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  },

  async getPaidDebtsByMonth(year, month) {
    // CORRECCIÓN: Usar 'paid_at' para filtrar pagos es correcto,
    // pero debemos asegurarnos de que la lógica de negocio use la fecha de pago efectiva.
    // Nota: 'paid_at' es un timestamp con zona horaria.
    
    const startDate = new Date(year, month, 1).toISOString();
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

  async addDebt(debt, userId) {
    // CAMBIO ARQUITECTÓNICO: Separación de Fecha de Trabajo vs Auditoría
    // 'date': Viene del formulario (Fecha de Trabajo)
    // 'created_at': Se omite para que Supabase use now() (Auditoría Real)
    
    const { data, error } = await supabase
      .from("debts")
      .insert({
        customer_name: debt.customer_name,
        amount: debt.amount,
        date: debt.date, // Nueva columna explícita
        status: DEBT_STATUS.PENDING,
        created_by: userId // Auditoría: Quién
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsPaid(id, paymentMethod, paymentDateStr, userId) {
    // Generamos el timestamp exacto con zona horaria Perú (-05:00)
    // Esto corrige el problema de "Time Travel" al guardar en UTC.
    const dateToSave = combineDateWithCurrentTime(paymentDateStr);

    const { data, error } = await supabase
      .from("debts")
      .update({
        status: DEBT_STATUS.PAID,
        paid_at: dateToSave,
        payment_method: paymentMethod,
        updated_by: userId // Auditoría: Quién modificó
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
        updated_by: userId // Auditoría: Quién modificó
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
