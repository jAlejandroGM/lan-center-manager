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
