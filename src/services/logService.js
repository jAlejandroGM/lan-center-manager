import { supabase } from "./supabase";

export const logService = {
  async getLogByDate(date) {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "Row not found"
      throw error;
    }
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

  async upsertLog(logData) {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(logData, { onConflict: "date" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
