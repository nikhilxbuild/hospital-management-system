import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminBilling = () => {
  const [bills, setBills] = useState<any[]>([]);

  const load = () => {
    supabase.from("billing").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setBills(data);
    });
  };
  useEffect(() => { load(); }, []);

  const markPaid = async (id: string) => {
    await supabase.from("billing").update({ status: "paid" }).eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Billing</h1>
      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Patient</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Doctor</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b">
                    <td className="p-3 text-foreground">{b.patient_name}</td>
                    <td className="p-3 text-foreground">{b.doctor_name}</td>
                    <td className="p-3 text-foreground">{b.date}</td>
                    <td className="p-3 font-semibold text-foreground">₹{b.amount}</td>
                    <td className="p-3"><Badge variant={b.status === "paid" ? "default" : "secondary"}>{b.status}</Badge></td>
                    <td className="p-3">
                      {b.status !== "paid" && <Button size="sm" variant="outline" onClick={() => markPaid(b.id)}>Mark Paid</Button>}
                      <Button size="sm" variant="ghost" className="ml-1" onClick={() => window.print()}>Print</Button>
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

export default AdminBilling;
