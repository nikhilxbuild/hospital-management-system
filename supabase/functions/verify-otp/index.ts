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
    const { phone, otp, name } = await req.json();
    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "Phone and OTP are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find valid OTP
    const { data: otpRecord } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("otp_code", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: "Invalid or expired OTP" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark OTP as verified
    await supabase.from("otp_codes").update({ verified: true }).eq("id", otpRecord.id);

    // Check if patient exists with this phone
    const { data: patient } = await supabase
      .from("patients")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    // Create or get auth user using phone as email placeholder
    const email = `${phone.replace(/[^0-9]/g, "")}@phone.local`;
    
    // Try to find existing auth user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;
    let session: any;

    if (existingUser) {
      // Generate a magic link session
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      
      if (signInError) throw signInError;
      
      // Use the token to create a session
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: signInData.properties.hashed_token,
        type: "magiclink",
      });
      
      if (verifyError) throw verifyError;
      userId = existingUser.id;
      session = verifyData.session;
    } else {
      // Create new user
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { name: name || patient?.name || phone, phone },
      });
      
      if (createError) throw createError;
      userId = newUser.user.id;

      // Sign in immediately
      const { data: signInData, error: signInError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      
      if (signInError) throw signInError;
      
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: signInData.properties.hashed_token,
        type: "magiclink",
      });
      
      if (verifyError) throw verifyError;
      session = verifyData.session;

      // Create patient record if not exists
      if (!patient) {
        await supabase.from("patients").insert({
          name: name || phone,
          phone,
          user_id: userId,
        });
      }
    }

    // Link patient to auth user if not linked
    if (patient && !patient.user_id) {
      await supabase.from("patients").update({ user_id: userId }).eq("id", patient.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        session,
        patientName: patient?.name || name || phone,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-otp error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
