import { createClient } from "@supabase/supabase-js";
import { ENVS } from "../config/envs";

const supabaseUrl = ENVS.SUPABASE_URL;
const supabaseKey = ENVS.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL or Key is missing. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
