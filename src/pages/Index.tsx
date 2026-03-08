import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Bone, Baby, FlaskConical, Ambulance, Star, ArrowRight, Clock, Users, Award, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { icon: Clock, value: "25+", label: "Years of Service" },
  { icon: Users, value: "50,000+", label: "Patients Treated" },
  { icon: Award, value: "120+", label: "Expert Doctors" },
  { icon: ThumbsUp, value: "98%", label: "Satisfaction Rate" },
];

const services = [
  { icon: Heart, name: "Cardiology", desc: "Advanced heart care with state-of-the-art catheterization lab" },
  { icon: Brain, name: "Neurology", desc: "Comprehensive brain and nervous system treatment" },
  { icon: Bone, name: "Orthopedics", desc: "Joint replacement and sports medicine specialists" },
  { icon: Baby, name: "Pediatrics", desc: "Compassionate care for your little ones" },
  { icon: FlaskConical, name: "Laboratory", desc: "24/7 diagnostic lab with quick report delivery" },
  { icon: Ambulance, name: "Emergency", desc: "Round-the-clock emergency and trauma services" },
];

const testimonials = [
  { name: "Priyanka M.", text: "The care I received at RK Hospital was exceptional. Dr. Rajesh Kumar and his team were very professional.", rating: 5 },
  { name: "Amit S.", text: "From booking to consultation, everything was smooth. Highly recommend their orthopedic department.", rating: 5 },
  { name: "Fatima K.", text: "Best hospital in Bandra. The staff is so caring and the facilities are world-class.", rating: 4 },
];

const Index = () => {
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("doctors").select("*").limit(3).then(({ data }) => {
      if (data) setDoctors(data);
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80 md:text-xl">
              RK Hospital, Bandra West — Mumbai's trusted multispecialty hospital delivering compassionate,
              world-class healthcare for over 25 years.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild className="text-primary font-semibold">
                <Link to="/book">Book Appointment <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/60 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
                <Link to="/doctors">View Our Doctors</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card py-12">
        <div className="container grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <s.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Our Specialties</h2>
            <p className="text-muted-foreground">Comprehensive healthcare services under one roof</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Card key={i} className="card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {doctors.length > 0 && (
        <section className="border-t bg-card py-16 md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-foreground">Meet Our Experts</h2>
              <p className="text-muted-foreground">Experienced doctors committed to your care</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => (
                <Card key={d.id} className="card-shadow text-center transition-all hover:card-shadow-hover">
                  <CardContent className="p-6">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
                      {d.img_emoji}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{d.name}</h3>
                    <p className="text-sm text-primary">{d.specialty}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{d.experience} years experience</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{d.rating}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link to="/doctors">View All Doctors <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Patient Stories</h2>
            <p className="text-muted-foreground">Hear from those who trust us with their health</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="card-shadow">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground italic">"{t.text}"</p>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
