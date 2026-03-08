import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminSMS = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("sms_log").select("*").order("sent_at", { ascending: false }).then(({ data }) => {
      if (data) setLogs(data);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">SMS Log</h1>
      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium text-muted-foreground">Patient</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Phone</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Message</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Time</th>
              </tr></thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="p-3 text-foreground">{l.patient_name}</td>
                    <td className="p-3 text-foreground">{l.phone}</td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate">{l.message}</td>
                    <td className="p-3"><Badge variant="outline">{l.status}</Badge></td>
                    <td className="p-3 text-muted-foreground">{new Date(l.sent_at).toLocaleString()}</td>
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

export default AdminSMS;
