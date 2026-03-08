import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient_name: "", phone: "", doctor_id: "", slot: "", date: "" });

  const load = () => {
    supabase.from("appointments").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setAppointments(data);
    });
    supabase.from("doctors").select("*").then(({ data }) => {
      if (data) setDoctors(data);
    });
  };

  useEffect(() => { load(); }, []);

  const selectedDoc = doctors.find((d) => d.id === form.doctor_id);

  const handleAdd = async () => {
    if (!form.patient_name || !form.doctor_id || !form.slot || !form.date) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }
    const token = `T-${Math.floor(100 + Math.random() * 900)}`;
    const doc = doctors.find((d) => d.id === form.doctor_id);

    // Upsert patient
    const { data: existingPatient } = await supabase.from("patients").select("id").eq("phone", form.phone).maybeSingle();
    let patientId = existingPatient?.id;
    if (!patientId) {
      const { data: np } = await supabase.from("patients").insert({ name: form.patient_name, phone: form.phone, email: "" }).select("id").single();
      patientId = np?.id;
    }

    await supabase.from("appointments").insert({
      patient_id: patientId,
      patient_name: form.patient_name,
      doctor_id: form.doctor_id,
      doctor_name: doc?.name || "",
      date: form.date,
      slot: form.slot,
      token,
      status: "confirmed",
      fee: doc?.fee || 0,
    });

    await supabase.from("sms_log").insert({
      patient_name: form.patient_name,
      phone: form.phone || "N/A",
      message: `Appointment booked. Token: ${token}, Doctor: ${doc?.name}, Date: ${form.date}, Slot: ${form.slot}. - RK Hospital`,
    });

    toast({ title: `Appointment added — Token: ${token}` });
    setOpen(false);
    setForm({ patient_name: "", phone: "", doctor_id: "", slot: "", date: "" });
    load();
  };

  const markCompleted = async (apt: any) => {
    // Update appointment status
    await supabase.from("appointments").update({ status: "completed" }).eq("id", apt.id);

    // Create billing entry for this appointment
    await supabase.from("billing").insert({
      appointment_id: apt.id,
      patient_name: apt.patient_name,
      doctor_name: apt.doctor_name,
      date: apt.date,
      amount: apt.fee || 0,
      status: "pending",
    });

    toast({ title: "Appointment completed — moved to billing" });
    load();
  };

  const markNotCompleted = async (id: string) => {
    await supabase.from("appointments").update({ status: "no-show" }).eq("id", id);
    toast({ title: "Marked as not completed (no-show)" });
    load();
  };

  const filtered = appointments.filter((a) =>
    a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
    a.token.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Appointment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Appointment</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Patient Name</Label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91" /></div>
              <div><Label>Doctor</Label>
                <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v, slot: "" })}>
                  <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                  <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              {selectedDoc && (
                <div><Label>Slot</Label>
                  <Select value={form.slot} onValueChange={(v) => setForm({ ...form, slot: v })}>
                    <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                    <SelectContent>{(selectedDoc.available_slots || []).map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button className="w-full" onClick={handleAdd}>Create Appointment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by patient, doctor, or token..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Token</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Patient</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Doctor</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Slot</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3 font-mono font-bold text-primary">{a.token}</td>
                    <td className="p-3 text-foreground">{a.patient_name}</td>
                    <td className="p-3 text-foreground">{a.doctor_name}</td>
                    <td className="p-3 text-foreground">{a.date}</td>
                    <td className="p-3 text-foreground">{a.slot}</td>
                    <td className="p-3"><Badge variant={a.status === "done" ? "secondary" : "default"}>{a.status}</Badge></td>
                    <td className="p-3">
                      {a.status !== "done" && <Button size="sm" variant="outline" onClick={() => markDone(a.id)}>Mark Done</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAppointments;
