import { createClient } from "@supabase/supabase-js";

import { Database } from "../types/database.types";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey)
  throw new Error("Missing Supabase URL or Anon Key");

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export { supabase };
