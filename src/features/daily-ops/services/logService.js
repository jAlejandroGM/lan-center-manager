import { supabase } from "../../../lib/supabase";
import { getMonthRangeLima } from "../../../lib/dateUtils";

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
    const { startDate, endDate } = getMonthRangeLima(year, month);

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
