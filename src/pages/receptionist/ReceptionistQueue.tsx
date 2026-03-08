import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ReceptionistQueue = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase.from("appointments").select("*").eq("date", today).order("slot").then(({ data }) => {
      if (data) setAppointments(data);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Today's Queue</h1>
      {appointments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No appointments today.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="card-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{a.token}</Badge>
                    <span className="font-semibold text-foreground">{a.patient_name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.doctor_name} • {a.slot}</p>
                </div>
                <Badge variant={a.status === "done" ? "secondary" : "default"}>{a.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueue;
