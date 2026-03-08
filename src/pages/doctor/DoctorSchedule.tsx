import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM",
];

const DoctorSchedule = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [days, setDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("staff_session") || "{}");
    supabase.from("doctors").select("*").eq("id", session.doctor_id).single().then(({ data }) => {
      if (data) {
        setDoctor(data);
        setDays(data.available_days || []);
        setSlots(data.available_slots || []);
      }
    });
  }, []);

  const save = async () => {
    if (!doctor) return;
    await supabase.from("doctors").update({ available_days: days, available_slots: slots }).eq("id", doctor.id);
    toast({ title: "Schedule updated" });
  };

  if (!doctor) return null;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">My Schedule</h1>
      <div className="space-y-6">
        <Card className="card-shadow">
          <CardHeader><CardTitle className="text-lg">Available Days</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((d) => (
                <button key={d} onClick={() => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${days.includes(d) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
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
                <button key={s} onClick={() => setSlots(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${slots.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Button onClick={save}>Save Schedule</Button>
      </div>
    </div>
  );
};

export default DoctorSchedule;
