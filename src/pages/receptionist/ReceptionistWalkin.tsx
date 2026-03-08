import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ReceptionistWalkin = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", doctor_id: "", slot: "" });
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("doctors").select("*").eq("available", true).then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  const selectedDoc = doctors.find((d) => d.id === form.doctor_id);

  const handleSubmit = async () => {
    if (!form.name || !form.doctor_id || !form.slot) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const token = `T-${Math.floor(100 + Math.random() * 900)}`;
    const doc = doctors.find((d) => d.id === form.doctor_id);
    const today = new Date().toISOString().split("T")[0];

    // Upsert patient
    let patientId: string | undefined;
    if (form.phone) {
      const { data: ep } = await supabase.from("patients").select("id").eq("phone", form.phone).maybeSingle();
      patientId = ep?.id;
    }
    if (!patientId) {
      const { data: np } = await supabase.from("patients").insert({ name: form.name, phone: form.phone || "", email: "" }).select("id").single();
      patientId = np?.id;
    }

    await supabase.from("appointments").insert({
      patient_id: patientId, patient_name: form.name, doctor_id: form.doctor_id,
      doctor_name: doc?.name || "", date: today, slot: form.slot, token,
      status: "confirmed", fee: doc?.fee || 0,
    });

    await supabase.from("sms_log").insert({
      patient_name: form.name, phone: form.phone || "N/A",
      message: `Walk-in appointment. Token: ${token}, Dr. ${doc?.name}, Slot: ${form.slot}. - RK Hospital`,
    });

    setDone(token);
  };

  if (done) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-sm card-shadow text-center">
          <CardContent className="p-8">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Walk-In Added</h2>
            <p className="mt-2 text-3xl font-bold text-primary">{done}</p>
            <Button className="mt-6" onClick={() => { setDone(null); setForm({ name: "", phone: "", doctor_id: "", slot: "" }); }}>
              Add Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Add Walk-In Patient</h1>
      <Card className="max-w-md card-shadow">
        <CardHeader><CardTitle className="text-lg">Patient Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Patient Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91" /></div>
          <div><Label>Doctor</Label>
            <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v, slot: "" })}>
              <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {selectedDoc && (
            <div><Label>Slot</Label>
              <Select value={form.slot} onValueChange={(v) => setForm({ ...form, slot: v })}>
                <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                <SelectContent>{(selectedDoc.available_slots || []).map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <Button className="w-full" onClick={handleSubmit}>Add Walk-In</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceptionistWalkin;
