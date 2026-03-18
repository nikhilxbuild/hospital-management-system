import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { format, getDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { generateToken } from "@/lib/tokenGenerator";

const dayNameMap: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(searchParams.get("doctor") || "");
  const [date, setDate] = useState<Date>();
  const [slot, setSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("doctors").select("*").eq("available", true).order("name").then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  const doctor = doctors.find((d) => d.id === selectedDoctor);
  const availableDayNums = (doctor?.available_days || []).map((d: string) => dayNameMap[d]);

  const isDateDisabled = (d: Date) => {
    if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    return !availableDayNums.includes(getDay(d));
  };

  const handleSubmit = async () => {
    if (!patientName.trim() || !phone.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const token = await generateToken(selectedDoctor, doctor.name);

    // Check if patient exists or create
    let patientId: string | null = null;
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      const { data: newPatient } = await supabase
        .from("patients")
        .insert({ name: patientName, phone, email: "" })
        .select("id")
        .single();
      if (newPatient) patientId = newPatient.id;
    }

    const appointmentData = {
      patient_id: patientId,
      patient_name: patientName,
      doctor_id: selectedDoctor,
      doctor_name: doctor.name,
      date: format(date!, "yyyy-MM-dd"),
      slot,
      token,
      status: "confirmed",
      fee: doctor.fee,
    };

    const { error } = await supabase.from("appointments").insert(appointmentData);

    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Add to SMS log
    await supabase.from("sms_log").insert({
      patient_name: patientName,
      phone,
      message: `Appointment confirmed! Token: ${token}, Doctor: ${doctor.name}, Date: ${format(date!, "dd MMM yyyy")}, Slot: ${slot}. Fee: ₹${doctor.fee}. - RK Hospital`,
      status: "sent",
    });

    setConfirmation({ token, doctorName: doctor.name, date: format(date!, "dd MMM yyyy"), slot, fee: doctor.fee });
    setLoading(false);
  };

  if (confirmation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <Card className="w-full max-w-md card-shadow">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
            <h2 className="mb-2 text-2xl font-bold text-foreground">Appointment Confirmed!</h2>
            <div className="mt-6 space-y-3 text-left">
              <div className="flex justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Token Number</span>
                <span className="text-lg font-bold text-primary">{confirmation.token}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Doctor</span>
                <span className="text-sm font-medium text-foreground">{confirmation.doctorName}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium text-foreground">{confirmation.date}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Time Slot</span>
                <span className="text-sm font-medium text-foreground">{confirmation.slot}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm text-muted-foreground">Consultation Fee</span>
                <span className="text-sm font-bold text-foreground">₹{confirmation.fee}</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              An SMS confirmation has been sent to your phone number.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground">Book an Appointment</h1>
          <p className="text-muted-foreground">Select your doctor and preferred time slot</p>
        </div>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Step {step} of 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <Label>Select Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={(v) => { setSelectedDoctor(v); setDate(undefined); setSlot(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} — {d.specialty} (₹{d.fee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDoctor && (
                  <div>
                    <Label>Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => { setDate(d); setSlot(""); }}
                          disabled={isDateDisabled}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {date && doctor && (
                  <div>
                    <Label>Select Time Slot</Label>
                    <Select value={slot} onValueChange={setSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {(doctor.available_slots || []).map((s: string) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button className="w-full" disabled={!selectedDoctor || !date || !slot} onClick={() => setStep(2)}>
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label>Patient Name</Label>
                  <Input placeholder="Enter full name" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="rounded-lg bg-secondary p-4 text-sm">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Doctor:</strong> {doctor?.name}<br />
                    <strong className="text-foreground">Date:</strong> {format(date!, "dd MMM yyyy")}<br />
                    <strong className="text-foreground">Time:</strong> {slot}<br />
                    <strong className="text-foreground">Fee:</strong> ₹{doctor?.fee}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;
