import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search } from "lucide-react";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");

  useEffect(() => {
    supabase.from("doctors").select("*").order("name").then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  const specialties = [...new Set(doctors.map((d) => d.specialty))];

  const filtered = doctors.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = specialty === "all" || d.specialty === specialty;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="py-12">
      <div className="container">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground">Our Doctors</h1>
          <p className="text-muted-foreground">Find the right specialist for your needs</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id} className="card-shadow transition-all hover:card-shadow-hover">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
                    {d.img_emoji}
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-700">{d.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{d.name}</h3>
                <p className="text-sm text-primary">{d.specialty}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-1">{d.experience} yrs exp</span>
                  <span className="rounded-full bg-secondary px-2 py-1">₹{d.fee} fee</span>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium">Available:</span>{" "}
                  {d.available_days?.slice(0, 3).join(", ")}
                  {d.available_days?.length > 3 && ` +${d.available_days.length - 3} more`}
                </div>
                {d.available && (
                  <Button className="mt-4 w-full" asChild>
                    <Link to={`/book?doctor=${d.id}`}>Book Appointment</Link>
                  </Button>
                )}
                {!d.available && (
                  <Button className="mt-4 w-full" variant="secondary" disabled>
                    Currently Unavailable
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No doctors found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
