import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Phone, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";

const LoginPage = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid phone", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIsExistingPatient(data.isExistingPatient);
      setPatientName(data.patientName || "");
      setDevOtp(data.dev_otp || "");
      setStep("otp");

      toast({
        title: data.isExistingPatient
          ? `Welcome back, ${data.patientName}!`
          : "OTP Sent",
        description: `Verification code sent to ${phone}`,
      });
    } catch (err: any) {
      toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code", variant: "destructive" });
      return;
    }
    if (!isExistingPatient && !name) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, otp, name: isExistingPatient ? patientName : name },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
        toast({ title: "Login successful", description: `Welcome, ${data.patientName}!` });
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Google login failed", description: String(error), variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md card-shadow">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl hero-gradient">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Patient Portal</CardTitle>
          <p className="text-sm text-muted-foreground">RK Hospital, Mumbai</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          {/* Phone OTP Login */}
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Mobile Number
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  If you've visited before, use the same number to access your records
                </p>
              </div>
              <Button className="w-full gap-2" type="submit" disabled={loading}>
                <Smartphone className="h-4 w-4" />
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-lg bg-secondary p-3 text-center">
                <p className="text-sm text-muted-foreground">
                  {isExistingPatient
                    ? `Welcome back, ${patientName}! Enter OTP to continue.`
                    : `Enter the OTP sent to ${phone}`}
                </p>
              </div>

              {!isExistingPatient && (
                <div>
                  <Label>Your Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>Enter OTP</Label>
                <div className="mt-2 flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {devOtp && (
                <p className="text-center text-xs text-muted-foreground">
                  Dev OTP: <span className="font-mono font-bold text-primary">{devOtp}</span>
                </p>
              )}

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setStep("phone"); setOtp(""); setDevOtp(""); }}
              >
                Change phone number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
