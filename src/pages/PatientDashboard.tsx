import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileText, Bell, LayoutDashboard, LogOut } from "lucide-react";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [smsLogs, setSmsLogs] = useState<any[]>([]);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: patient } = await supabase.from("patients").select("*").eq("user_id", user.id).maybeSingle();
      if (patient) {
        setPatientName(patient.name);
        const { data: appts } = await supabase.from("appointments").select("*").eq("patient_name", patient.name).order("date", { ascending: false });
        if (appts) setAppointments(appts);
        const { data: sms } = await supabase.from("sms_log").select("*").eq("patient_name", patient.name).order("sent_at", { ascending: false });
        if (sms) setSmsLogs(sms);
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const upcoming = appointments.filter((a) => a.status === "confirmed");
  const statusColor = (s: string) => {
    if (s === "confirmed") return "default";
    if (s === "done") return "secondary";
    return "outline";
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Welcome, {patientName}</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
      <div className="container py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
            <TabsTrigger value="records"><FileText className="mr-2 h-4 w-4" />Records</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card className="card-shadow"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Visits</p><p className="text-3xl font-bold text-foreground">{appointments.length}</p></CardContent></Card>
              <Card className="card-shadow"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Upcoming</p><p className="text-3xl font-bold text-primary">{upcoming.length}</p></CardContent></Card>
              <Card className="card-shadow"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Completed</p><p className="text-3xl font-bold text-accent">{appointments.filter(a => a.status === "done").length}</p></CardContent></Card>
            </div>
            {upcoming.length > 0 && (
              <Card className="card-shadow">
                <CardHeader><CardTitle className="text-lg">Upcoming Appointments</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcoming.slice(0, 3).map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg bg-secondary p-4">
                        <div>
                          <p className="font-medium text-foreground">{a.doctor_name}</p>
                          <p className="text-sm text-muted-foreground">{a.date} • {a.slot}</p>
                        </div>
                        <Badge>{a.token}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="card-shadow">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium text-muted-foreground">Token</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Doctor</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Slot</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                      <th className="p-3 text-left font-medium text-muted-foreground">Next Visit</th>
                    </tr></thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="p-3 font-mono font-bold text-primary">{a.token}</td>
                          <td className="p-3 text-foreground">{a.doctor_name}</td>
                          <td className="p-3 text-foreground">{a.date}</td>
                          <td className="p-3 text-foreground">{a.slot}</td>
                          <td className="p-3"><Badge variant={statusColor(a.status)}>{a.status}</Badge></td>
                          <td className="p-3 text-muted-foreground">{a.next_visit || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card className="card-shadow">
              <CardContent className="p-6">
                {appointments.filter(a => a.status === "done").length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No medical records yet.</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === "done").map((a) => (
                      <div key={a.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{a.doctor_name}</span>
                          <span className="text-sm text-muted-foreground">{a.date}</span>
                        </div>
                        {a.prescription && <p className="text-sm text-foreground"><strong>Prescription:</strong> {a.prescription}</p>}
                        {a.notes && <p className="text-sm text-muted-foreground mt-1"><strong>Notes:</strong> {a.notes}</p>}
                        {a.lab_report && <p className="text-sm text-muted-foreground mt-1"><strong>Lab Report:</strong> {a.lab_report}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="card-shadow">
              <CardContent className="p-6">
                {smsLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No notifications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {smsLogs.map((s) => (
                      <div key={s.id} className="rounded-lg bg-secondary p-4">
                        <p className="text-sm text-foreground">{s.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(s.sent_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
