import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");
  const [doctorId, setDoctorId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("doctors").select("id, name, username").then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  useEffect(() => {
    if (role === "doctor" && doctorId) {
      const doc = doctors.find((d) => d.id === doctorId);
      if (doc) setUsername(doc.username || "");
    } else if (role === "admin") {
      setUsername("admin");
    } else if (role === "receptionist") {
      setUsername("receptionist");
    }
  }, [role, doctorId, doctors]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("staff_users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .eq("role", role)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "Invalid credentials", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Store staff session in localStorage
    localStorage.setItem("staff_session", JSON.stringify({
      id: data.id,
      username: data.username,
      role: data.role,
      doctor_id: data.doctor_id,
    }));

    if (data.role === "admin") navigate("/admin/dashboard");
    else if (data.role === "doctor") navigate("/doctor/dashboard");
    else navigate("/receptionist/dashboard");

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <Card className="w-full max-w-md border-sidebar-border bg-sidebar-accent">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary">
            <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <CardTitle className="text-xl text-sidebar-foreground">Staff Portal</CardTitle>
          <p className="text-sm text-sidebar-foreground/60">RK Hospital — Authorized Personnel Only</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-sidebar-foreground">Role</Label>
              <Select value={role} onValueChange={(v) => { setRole(v); setDoctorId(""); setUsername(""); setPassword(""); }}>
                <SelectTrigger className="border-sidebar-border bg-sidebar text-sidebar-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "doctor" && (
              <div>
                <Label className="text-sidebar-foreground">Select Doctor</Label>
                <Select value={doctorId} onValueChange={setDoctorId}>
                  <SelectTrigger className="border-sidebar-border bg-sidebar text-sidebar-foreground">
                    <SelectValue placeholder="Choose your profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sidebar-foreground">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-sidebar-border bg-sidebar text-sidebar-foreground"
                placeholder="Username"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-sidebar-border bg-sidebar text-sidebar-foreground"
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
