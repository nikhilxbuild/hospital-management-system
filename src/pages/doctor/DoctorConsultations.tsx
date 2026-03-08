import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DoctorConsultations = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("staff_session") || "{}");
    supabase.from("appointments").select("*").eq("doctor_id", session.doctor_id).eq("status", "done").order("date", { ascending: false }).then(({ data }) => {
      if (data) setAppointments(data);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">My Consultations</h1>
      {appointments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No completed consultations yet.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge>{a.token}</Badge>
                    <span className="font-semibold text-foreground">{a.patient_name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{a.date}</span>
                </div>
                {a.disease && <p className="text-sm text-foreground"><strong>Diagnosis:</strong> {a.disease}</p>}
                {a.prescription && <p className="text-sm text-foreground"><strong>Rx:</strong> {a.prescription}</p>}
                {a.notes && <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {a.notes}</p>}
                {a.lab_report && <p className="text-sm text-muted-foreground"><strong>Lab:</strong> {a.lab_report}</p>}
                {a.next_visit && <p className="text-sm text-primary mt-1"><strong>Next Visit:</strong> {a.next_visit}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorConsultations;
