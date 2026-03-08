import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const DoctorQueue = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "", lab_report: "", next_visit: "" });

  const load = () => {
    const session = JSON.parse(localStorage.getItem("staff_session") || "{}");
    const today = new Date().toISOString().split("T")[0];
    supabase.from("appointments").select("*").eq("doctor_id", session.doctor_id).eq("date", today).order("slot").then(({ data }) => {
      if (data) setAppointments(data);
    });
  };
  useEffect(() => { load(); }, []);

  const handleConsultation = async () => {
    if (!selected) return;
    await supabase.from("appointments").update({
      status: "done", disease: form.diagnosis, prescription: form.prescription,
      notes: form.notes, lab_report: form.lab_report, next_visit: form.next_visit || null,
    }).eq("id", selected.id);

    await supabase.from("billing").insert({
      appointment_id: selected.id, patient_name: selected.patient_name,
      doctor_name: selected.doctor_name, date: selected.date, amount: selected.fee || 0, status: "pending",
    });

    await supabase.from("sms_log").insert({
      patient_name: selected.patient_name, phone: "N/A",
      message: `Consultation done. Dr. ${selected.doctor_name}. Rx: ${form.prescription}. ${form.next_visit ? `Next: ${form.next_visit}` : ""} - RK Hospital`,
    });

    toast({ title: "Consultation completed" });
    setSelected(null);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Today's Queue</h1>
      {appointments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No patients in queue today.</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} className="card-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge>{a.token}</Badge>
                    <span className="font-semibold text-foreground">{a.patient_name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.slot}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.status === "done" ? "secondary" : "default"}>{a.status}</Badge>
                  {a.status !== "done" && (
                    <Button size="sm" onClick={() => { setSelected(a); setForm({ diagnosis: "", prescription: "", notes: "", lab_report: "", next_visit: "" }); }}>
                      Consult
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Consultation — {selected?.patient_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
            <div><Label>Prescription</Label><Textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} rows={3} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div><Label>Lab Report</Label><Input value={form.lab_report} onChange={(e) => setForm({ ...form, lab_report: e.target.value })} /></div>
            <div><Label>Next Visit</Label><Input type="date" value={form.next_visit} onChange={(e) => setForm({ ...form, next_visit: e.target.value })} /></div>
            <Button className="w-full" onClick={handleConsultation}>Complete Consultation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorQueue;
