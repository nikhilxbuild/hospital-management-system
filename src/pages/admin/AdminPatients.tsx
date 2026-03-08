import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", blood_group: "", address: "" });

  const load = () => {
    supabase.from("patients").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setPatients(data);
    });
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    await supabase.from("patients").insert({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      phone: form.phone,
      email: form.email,
      blood_group: form.blood_group,
      address: form.address,
    });
    toast({ title: "Patient registered" });
    setOpen(false);
    setForm({ name: "", age: "", phone: "", email: "", blood_group: "", address: "" });
    load();
  };

  const viewHistory = async (patient: any) => {
    setSelectedPatient(patient);
    const { data } = await supabase.from("appointments").select("*").eq("patient_name", patient.name).order("date", { ascending: false });
    setHistory(data || []);
    setHistoryOpen(true);
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || "").includes(search)
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Register Patient</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Patient</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label>Blood Group</Label><Input value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} placeholder="A+, B-, O+" /></div>
              </div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <Button className="w-full" onClick={handleAdd}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Age</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Blood</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 font-medium text-foreground">{p.name}</td>
                    <td className="p-3 text-foreground">{p.age || "—"}</td>
                    <td className="p-3 text-foreground">{p.phone || "—"}</td>
                    <td className="p-3 text-foreground">{p.blood_group || "—"}</td>
                    <td className="p-3"><Button size="sm" variant="ghost" onClick={() => viewHistory(p)}><Eye className="mr-1 h-4 w-4" />History</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Visit History — {selectedPatient?.name}</DialogTitle></DialogHeader>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No visits recorded.</p>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {history.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-foreground">{a.doctor_name}</span>
                    <Badge variant="outline">{a.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.date} • {a.slot} • Token: {a.token}</p>
                  {a.prescription && <p className="mt-1 text-sm text-foreground"><strong>Rx:</strong> {a.prescription}</p>}
                  {a.notes && <p className="text-sm text-muted-foreground"><strong>Notes:</strong> {a.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPatients;
