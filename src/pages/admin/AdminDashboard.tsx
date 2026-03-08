import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, CheckCircle, Clock, IndianRupee } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0, revenue: 0 });
  const [doctors, setDoctors] = useState<any[]>([]);
  const [todayAppts, setTodayAppts] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase.from("appointments").select("*").eq("date", today),
      supabase.from("doctors").select("*"),
      supabase.from("billing").select("amount").eq("status", "paid"),
    ]).then(([apptRes, docRes, billRes]) => {
      const appts = apptRes.data || [];
      setTodayAppts(appts);
      setStats({
        total: appts.length,
        done: appts.filter((a) => a.status === "done").length,
        pending: appts.filter((a) => a.status === "confirmed").length,
        revenue: (billRes.data || []).reduce((s, b) => s + b.amount, 0),
      });
      setDoctors(docRes.data || []);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { icon: CalendarDays, label: "Today's Appointments", value: stats.total, color: "text-primary" },
          { icon: CheckCircle, label: "Completed", value: stats.done, color: "text-accent" },
          { icon: Clock, label: "Pending", value: stats.pending, color: "text-amber-500" },
          { icon: IndianRupee, label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, color: "text-primary" },
        ].map((s, i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-shadow">
        <CardHeader><CardTitle className="text-lg">Doctor Capacity — Today</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {doctors.map((d) => {
            const docAppts = todayAppts.filter((a) => a.doctor_id === d.id).length;
            const maxSlots = (d.available_slots || []).length;
            const pct = maxSlots > 0 ? Math.round((docAppts / maxSlots) * 100) : 0;
            return (
              <div key={d.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{d.name}</span>
                  <span className="text-muted-foreground">{docAppts}/{maxSlots} slots</span>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
