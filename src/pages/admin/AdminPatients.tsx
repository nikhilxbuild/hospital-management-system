import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Eye, User, Phone, Mail, MapPin, Droplets, Calendar, FileText, Pill, Stethoscope } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminPatients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [billings, setBillings] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", blood_group: "", address: "" });

  const load = () => {
    supabase.from("patients").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setPatients(data);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const { error } = await supabase.from("patients").insert({
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      phone: form.phone || null,
      email: form.email || null,
      blood_group: form.blood_group || null,
      address: form.address || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Patient registered" });
    setAddOpen(false);
    setForm({ name: "", age: "", phone: "", email: "", blood_group: "", address: "" });
    load();
  };

  const viewPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setDetailOpen(true);

    const [apptRes, billRes] = await Promise.all([
      supabase.from("appointments").select("*").eq("patient_id", patient.id).order("date", { ascending: false }),
      supabase.from("billing").select("*").eq("patient_name", patient.name).order("date", { ascending: false }),
    ]);
    setAppointments(apptRes.data || []);
    setBillings(billRes.data || []);
  };

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || "").includes(search) ||
    (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "done") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (s === "confirmed") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (s === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
          <p className="text-sm text-muted-foreground">{patients.length} total patients</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Register Patient</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Register New Patient</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label>Blood Group</Label><Input value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} placeholder="A+, B-, O+" /></div>
              </div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <Button className="w-full" onClick={handleAdd} disabled={!form.name.trim()}>Register</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, phone, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-3">
        {filtered.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => viewPatient(p)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                    {p.age && <span>Age: {p.age}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    {p.blood_group && <span className="font-medium text-red-500">{p.blood_group}</span>}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost"><Eye className="mr-1 h-4 w-4" />View</Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No patients found.</p>
        )}
      </div>

      {/* Patient Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> {selectedPatient.name}
                </DialogTitle>
              </DialogHeader>

              {/* Patient Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {selectedPatient.age && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Age: <span className="text-foreground font-medium">{selectedPatient.age}</span>
                  </div>
                )}
                {selectedPatient.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> <span className="text-foreground font-medium">{selectedPatient.phone}</span>
                  </div>
                )}
                {selectedPatient.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> <span className="text-foreground font-medium">{selectedPatient.email}</span>
                  </div>
                )}
                {selectedPatient.blood_group && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="h-4 w-4 text-red-500" /> <span className="text-foreground font-medium">{selectedPatient.blood_group}</span>
                  </div>
                )}
                {selectedPatient.address && (
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <MapPin className="h-4 w-4" /> <span className="text-foreground font-medium">{selectedPatient.address}</span>
                  </div>
                )}
              </div>

              <Tabs defaultValue="visits" className="mt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="visits" className="flex-1">Visits ({appointments.length})</TabsTrigger>
                  <TabsTrigger value="billing" className="flex-1">Billing ({billings.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="visits" className="space-y-3 mt-3">
                  {appointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No visit records.</p>
                  ) : (
                    appointments.map((a) => (
                      <Card key={a.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-foreground">{a.doctor_name}</span>
                            </div>
                            <Badge className={statusColor(a.status)}>{a.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {a.date} • {a.slot} • Token: {a.token}
                          </p>
                          {a.disease && (
                            <div className="text-sm">
                              <span className="font-medium text-foreground">Diagnosis:</span>{" "}
                              <span className="text-muted-foreground">{a.disease}</span>
                            </div>
                          )}
                          {a.prescription && (
                            <div className="text-sm flex items-start gap-1.5">
                              <Pill className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-medium text-foreground">Prescription:</span>{" "}
                                <span className="text-muted-foreground">{a.prescription}</span>
                              </div>
                            </div>
                          )}
                          {a.notes && (
                            <div className="text-sm flex items-start gap-1.5">
                              <FileText className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-medium text-foreground">Notes:</span>{" "}
                                <span className="text-muted-foreground">{a.notes}</span>
                              </div>
                            </div>
                          )}
                          {a.lab_report && (
                            <div className="text-sm">
                              <span className="font-medium text-foreground">Lab Report:</span>{" "}
                              <span className="text-muted-foreground">{a.lab_report}</span>
                            </div>
                          )}
                          {a.next_visit && (
                            <p className="text-xs text-primary font-medium">Next visit: {a.next_visit}</p>
                          )}
                          {a.fee && (
                            <p className="text-xs text-muted-foreground">Fee: ₹{a.fee}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="billing" className="space-y-3 mt-3">
                  {billings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No billing records.</p>
                  ) : (
                    billings.map((b) => (
                      <div key={b.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-foreground">{b.doctor_name}</p>
                          <p className="text-xs text-muted-foreground">{b.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{b.amount}</p>
                          <Badge variant={b.status === "paid" ? "default" : "outline"}>{b.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPatients;
