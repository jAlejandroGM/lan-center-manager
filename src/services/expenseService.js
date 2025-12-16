import { supabase } from "./supabase";

export const expenseService = {
  async getExpensesByDate(date) {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getExpensesByMonth(year, month) {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  },

  async addExpense(expense, userId) {
    // 'expense' trae 'date' (Fecha de Trabajo).
    // 'created_at' se generará automáticamente en la BD (Tiempo del Sistema).
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        ...expense,
        // created_by: userId // Preparado para auditoría futura
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id, userId) {
    // userId podría usarse aquí para verificar permisos o loguear el borrado
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
