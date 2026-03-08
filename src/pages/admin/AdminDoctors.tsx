import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Star, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "", fee: "500", experience: "5", username: "", password: "", about: "" });

  const load = () => {
    supabase.from("doctors").select("*").order("name").then(({ data }) => {
      if (data) setDoctors(data);
    });
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const { error } = await supabase.from("doctors").insert({
      name: form.name,
      specialty: form.specialty,
      fee: parseInt(form.fee),
      experience: parseInt(form.experience),
      username: form.username,
      password: form.password,
      about: form.about,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    // Also create staff user
    const { data: newDoc } = await supabase.from("doctors").select("id").eq("username", form.username).single();
    if (newDoc) {
      await supabase.from("staff_users").insert({ username: form.username, password: form.password, role: "doctor" as const, doctor_id: newDoc.id });
    }
    toast({ title: "Doctor added" });
    setOpen(false);
    load();
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from("doctors").update({ available: !current }).eq("id", id);
    load();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add Doctor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Fee (₹)</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
                <div><Label>Experience (yrs)</Label><Input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
              </div>
              <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div><Label>Password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div><Label>About</Label><Input value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} /></div>
              <Button className="w-full" onClick={handleAdd}>Add Doctor</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((d) => (
          <Card key={d.id} className="card-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-2xl">{d.img_emoji}</div>
                <div>
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-sm text-primary">{d.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{d.rating}</span> • <span>{d.experience} yrs</span> • <span>₹{d.fee}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={d.available ? "default" : "secondary"}>{d.available ? "Active" : "Off Duty"}</Badge>
                <Switch checked={d.available} onCheckedChange={() => toggleAvailability(d.id, d.available)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDoctors;
