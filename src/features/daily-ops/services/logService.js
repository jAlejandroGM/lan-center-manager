import { supabase } from "../../../lib/supabase";

export const logService = {
  async getLogsByDate(date) {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getLogsByMonth(year, month) {
    // month is 0-indexed (0 = January)
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;
    return data;
  },

  async addLog(logData, userId) {
    // Registra el cierre de caja diario.
    // La fecha 'date' es YYYY-MM-DD y es crítica para el historial.
    const { data, error } = await supabase
      .from("daily_logs")
      .insert({
        ...logData,
        // created_by: userId // Preparado para auditoría futura
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
