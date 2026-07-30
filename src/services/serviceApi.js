import { supabase } from "../lib/supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("status", "published")
    .order("display_order", { ascending: true });

  if (error) throw error;

  return data;
}