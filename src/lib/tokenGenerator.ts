import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a daily-resetting token based on doctor's name.
 * Format: First letter of doctor's actual name (skipping "Dr.") + sequential number
 * e.g., R1, R2 for Dr. Rajesh; A1, A2 for Dr. Anjali
 * Resets daily per doctor per date.
 */
export async function generateToken(doctorId: string, doctorName: string, appointmentDate: string): Promise<string> {
  // Skip "Dr." or "Dr " prefix to get actual name initial
  const cleanName = doctorName.replace(/^Dr\.?\s*/i, "").trim();
  const prefix = cleanName.charAt(0).toUpperCase();

  // Count appointments for this doctor on the given date
  const { count } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .eq("date", appointmentDate);

  const nextNumber = (count || 0) + 1;
  return `${prefix}${nextNumber}`;
}
