import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { Database } from "../types/database.types";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

// if (supabaseUrl && supabaseAnonKey) {
//   supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
// }

export { supabase };

export function initSupabase() {
  console.log("init supabase 2");
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

  return supabase;
}
