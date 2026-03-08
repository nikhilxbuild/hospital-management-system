import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, CheckCircle, Clock } from "lucide-react";

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0 });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("appointments").select("*").eq("date", today).then(({ data }) => {
      const appts = data || [];
      setStats({
        total: appts.length,
        done: appts.filter((a) => a.status === "done").length,
        pending: appts.filter((a) => a.status === "confirmed").length,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Reception Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: CalendarDays, label: "Today's Total", value: stats.total, color: "text-primary" },
          { icon: CheckCircle, label: "Completed", value: stats.done, color: "text-accent" },
          { icon: Clock, label: "Pending", value: stats.pending, color: "text-amber-500" },
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

export default ReceptionistDashboard;
