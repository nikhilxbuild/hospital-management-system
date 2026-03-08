import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle, Clock, Users } from "lucide-react";

const DoctorDashboard = () => {
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0, patients: 0 });

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("staff_session") || "{}");
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase.from("appointments").select("*").eq("doctor_id", session.doctor_id).eq("date", today),
      supabase.from("appointments").select("id", { count: "exact" }).eq("doctor_id", session.doctor_id),
    ]).then(([todayRes, allRes]) => {
      const appts = todayRes.data || [];
      setStats({
        total: appts.length,
        done: appts.filter((a) => a.status === "done").length,
        pending: appts.filter((a) => a.status === "confirmed").length,
        patients: allRes.count || 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">My Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: CalendarDays, label: "Today's Patients", value: stats.total, color: "text-primary" },
          { icon: CheckCircle, label: "Completed", value: stats.done, color: "text-accent" },
          { icon: Clock, label: "Pending", value: stats.pending, color: "text-amber-500" },
          { icon: Users, label: "Total Patients", value: stats.patients, color: "text-primary" },
        ].map((s, i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="p-6">
              <s.icon className={`h-8 w-8 ${s.color} mb-2`} />
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;
