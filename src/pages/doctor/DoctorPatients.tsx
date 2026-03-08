import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

const DoctorPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("staff_session") || "{}");
    supabase.from("appointments").select("patient_name, patient_id").eq("doctor_id", session.doctor_id).then(({ data }) => {
      if (data) {
        const unique = [...new Map(data.map((d) => [d.patient_name, d])).values()];
        setPatients(unique);
      }
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">My Patients</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {patients.map((p, i) => (
          <Card key={i} className="card-shadow">
            <CardContent className="p-4">
              <p className="font-semibold text-foreground">{p.patient_name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {patients.length === 0 && <p className="text-center text-muted-foreground py-12">No patients yet.</p>}
    </div>
  );
};

export default DoctorPatients;
