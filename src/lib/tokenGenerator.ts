import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a daily-resetting token based on doctor's name.
 * Format: First letter of doctor name (uppercase) + sequential number
 * e.g., R1, R2 for Dr. Rahul; A1, A2 for Dr. Akash
 * Resets daily.
 */
export async function generateToken(doctorId: string, doctorName: string): Promise<string> {
  const prefix = doctorName.trim().charAt(0).toUpperCase();
  const today = new Date().toISOString().split("T")[0];

  // Count today's appointments for this doctor
  const { count } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .eq("date", today);

  const nextNumber = (count || 0) + 1;
  return `${prefix}${nextNumber}`;
}
