import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const AdminConsultations = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "", lab_report: "", next_visit: "" });

  const load = () => {
    supabase.from("appointments").select("*").in("status", ["confirmed", "in-progress"]).order("date").then(({ data }) => {
      if (data) setAppointments(data);
    });
  };
  useEffect(() => { load(); }, []);

  const handleConsultation = async () => {
    if (!selected) return;
    // Update appointment
    await supabase.from("appointments").update({
      status: "done",
      disease: form.diagnosis,
      prescription: form.prescription,
      notes: form.notes,
      lab_report: form.lab_report,
      next_visit: form.next_visit || null,
    }).eq("id", selected.id);

    // Create billing
    await supabase.from("billing").insert({
      appointment_id: selected.id,
      patient_name: selected.patient_name,
      doctor_name: selected.doctor_name,
      date: selected.date,
      amount: selected.fee || 0,
      status: "pending",
    });

    // SMS log
    await supabase.from("sms_log").insert({
      patient_name: selected.patient_name,
      phone: "N/A",
      message: `Consultation complete. Doctor: ${selected.doctor_name}. Diagnosis: ${form.diagnosis}. ${form.next_visit ? `Next visit: ${form.next_visit}` : ""} - RK Hospital`,
    });

    toast({ title: "Consultation completed & billing created" });
    setSelected(null);
    setForm({ diagnosis: "", prescription: "", notes: "", lab_report: "", next_visit: "" });
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Consultations</h1>

      {appointments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No pending consultations.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((a) => (
            <Card key={a.id} className="card-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge>{a.token}</Badge>
                  <Badge variant="outline">{a.status}</Badge>
                </div>
                <p className="font-semibold text-foreground">{a.patient_name}</p>
                <p className="text-sm text-muted-foreground">{a.doctor_name} • {a.date} • {a.slot}</p>
                <Button className="mt-3 w-full" variant="outline" onClick={() => { setSelected(a); setForm({ diagnosis: "", prescription: "", notes: "", lab_report: "", next_visit: "" }); }}>
                  Start Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Consultation — {selected?.patient_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <p className="text-foreground"><strong>Token:</strong> {selected?.token} | <strong>Doctor:</strong> {selected?.doctor_name}</p>
              <p className="text-muted-foreground">{selected?.date} • {selected?.slot}</p>
            </div>
            <div><Label>Diagnosis</Label><Input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
            <div><Label>Prescription</Label><Textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} rows={3} /></div>
            <div><Label>Doctor Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div><Label>Lab Report Result</Label><Input value={form.lab_report} onChange={(e) => setForm({ ...form, lab_report: e.target.value })} /></div>
            <div><Label>Next Visit Date</Label><Input type="date" value={form.next_visit} onChange={(e) => setForm({ ...form, next_visit: e.target.value })} /></div>
            <Button className="w-full" onClick={handleConsultation}>Complete Consultation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConsultations;
