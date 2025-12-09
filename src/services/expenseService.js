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

  async addExpense(expense) {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};
