import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

const AdminSchedules = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [maxPatients, setMaxPatients] = useState(30);

  useEffect(() => {
    supabase.from("doctors").select("*").then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  useEffect(() => {
    const doc = doctors.find((d) => d.id === selectedId);
    if (doc) {
      setDays(doc.available_days || []);
      setSlots(doc.available_slots || []);
      setMaxPatients(doc.max_patients_per_day || 30);
    }
  }, [selectedId, doctors]);

  const toggleDay = (day: string) => {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot: string) => {
    setSlots((prev) => prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]);
  };

  const save = async () => {
    await supabase.from("doctors").update({ available_days: days, available_slots: slots, max_patients_per_day: maxPatients } as any).eq("id", selectedId);
    toast({ title: "Schedule updated" });
    // refresh
    const { data } = await supabase.from("doctors").select("*");
    if (data) setDoctors(data);
  };

  const toggleActive = async () => {
    const doc = doctors.find((d) => d.id === selectedId);
    if (!doc) return;
    await supabase.from("doctors").update({ available: !doc.available }).eq("id", selectedId);
    toast({ title: doc.available ? "Doctor set to Off Duty" : "Doctor set to Active" });
    const { data } = await supabase.from("doctors").select("*");
    if (data) setDoctors(data);
  };

  const doc = doctors.find((d) => d.id === selectedId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Doctor Schedules</h1>

      <div className="mb-6">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name} — {d.specialty}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {doc && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant={doc.available ? "default" : "destructive"} onClick={toggleActive}>
              {doc.available ? "Active ✓" : "Off Duty ✗"} — Toggle
            </Button>
          </div>

          <Card className="card-shadow">
            <CardHeader><CardTitle className="text-lg">Available Days</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      days.includes(d) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-shadow">
            <CardHeader><CardTitle className="text-lg">Available Slots</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ALL_SLOTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSlot(s)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      slots.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} className="w-full max-w-xs">Save Schedule</Button>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
