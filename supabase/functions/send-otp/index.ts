import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if this phone exists in patients table
    const { data: patient } = await supabase
      .from("patients")
      .select("id, name, phone")
      .eq("phone", phone)
      .maybeSingle();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    // Delete old OTPs for this phone
    await supabase.from("otp_codes").delete().eq("phone", phone);

    // Insert new OTP
    await supabase.from("otp_codes").insert({
      phone,
      otp_code: otp,
      expires_at: expiresAt,
    });

    // In production, send SMS here via Twilio/MSG91
    // For now, log it (visible in edge function logs)
    console.log(`OTP for ${phone}: ${otp}`);

    return new Response(
      JSON.stringify({
        success: true,
        isExistingPatient: !!patient,
        patientName: patient?.name || null,
        // DEV ONLY - remove in production
        dev_otp: otp,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
