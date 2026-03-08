import { Card, CardContent } from "@/components/ui/card";
import { Award, Users, Clock, Shield, Target, Heart } from "lucide-react";

const values = [
  { icon: Heart, title: "Compassion", desc: "Treating every patient with empathy and dignity" },
  { icon: Target, title: "Excellence", desc: "Pursuing the highest standards of medical care" },
  { icon: Shield, title: "Integrity", desc: "Maintaining transparency in all our practices" },
  { icon: Users, title: "Teamwork", desc: "Collaborating across specialties for best outcomes" },
];

const AboutPage = () => (
  <div className="py-12">
    <div className="container">
      {/* Header */}
      <div className="mb-16 text-center">
        <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">About RK Hospital</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          A legacy of trust, quality healthcare, and compassionate service since 1999.
        </p>
      </div>

      {/* History */}
      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Our Story</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Founded in 1999 by <strong className="text-foreground">Dr. Ramesh Kumar</strong>, RK Hospital began as a small
            clinic in the heart of Bandra West, Mumbai, with a vision to make quality healthcare
            accessible to every family.
          </p>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            Over the past 25+ years, we've grown into a 200-bed multispecialty hospital with
            state-of-the-art facilities, serving over 50,000 patients. Our team of 120+ experienced
            doctors continues Dr. Kumar's legacy of combining medical excellence with genuine care.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Today, RK Hospital stands as one of Mumbai's most trusted healthcare institutions,
            recognized for its advanced treatment protocols, patient-first approach, and commitment
            to making a difference in the community.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, value: "25+", label: "Years of Service" },
              { icon: Users, value: "50,000+", label: "Patients Treated" },
              { icon: Award, value: "120+", label: "Expert Doctors" },
              { icon: Shield, value: "200", label: "Bed Capacity" },
            ].map((s, i) => (
              <Card key={i} className="card-shadow text-center">
                <CardContent className="p-6">
                  <s.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Our Values</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Card key={i} className="card-shadow text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Accreditations */}
      <div className="rounded-xl bg-card p-8 card-shadow text-center">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Accreditations & Certifications</h2>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {["ISO 9001:2015", "JCI Accredited", "NABH Certified", "NABL Lab"].map((a) => (
            <div key={a} className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AboutPage;
