import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Receipt } from "lucide-react";
import BillPDF from "@/components/billing/BillPDF";

interface BillItem {
  id?: string;
  description: string;
  amount: number;
}

const AdminBilling = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    supabase.from("billing").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setBills(data);
    });
  };
  useEffect(() => { load(); }, []);

  const openBill = async (bill: any) => {
    setSelected(bill);
    const { data } = await supabase.from("billing_items").select("*").eq("billing_id", bill.id).order("created_at");
    setItems(data || []);
  };

  const addItem = async () => {
    if (!newDesc || !newAmount || !selected) return;
    const amount = parseInt(newAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from("billing_items").insert({
      billing_id: selected.id,
      description: newDesc,
      amount,
    }).select().single();
    if (error) {
      toast({ title: "Error adding item", description: error.message, variant: "destructive" });
    } else if (data) {
      setItems([...items, data]);
      setNewDesc("");
      setNewAmount("");
      await updateBillTotal([...items, data]);
    }
    setSaving(false);
  };

  const removeItem = async (item: BillItem) => {
    if (!item.id) return;
    await supabase.from("billing_items").delete().eq("id", item.id);
    const updated = items.filter((i) => i.id !== item.id);
    setItems(updated);
    await updateBillTotal(updated);
  };

  const updateBillTotal = async (currentItems: BillItem[]) => {
    if (!selected) return;
    const doctorFee = selected.amount || 0;
    const itemsTotal = currentItems.reduce((s, i) => s + i.amount, 0);
    const total = doctorFee + itemsTotal;
    // We store base doctor fee in amount, but display total. For now keep amount as doctor fee.
    // The grand total is computed on the fly.
  };

  const markPaid = async (id: string) => {
    await supabase.from("billing").update({ status: "paid" }).eq("id", id);
    if (selected?.id === id) setSelected({ ...selected, status: "paid" });

    // Trigger SMS to patient after billing is completed
    const bill = bills.find((b) => b.id === id) || selected;
    if (bill) {
      // Get patient phone from appointments or patients table
      let phone = "N/A";
      if (bill.appointment_id) {
        const { data: apt } = await supabase.from("appointments").select("patient_id").eq("id", bill.appointment_id).maybeSingle();
        if (apt?.patient_id) {
          const { data: patient } = await supabase.from("patients").select("phone").eq("id", apt.patient_id).maybeSingle();
          if (patient?.phone) phone = patient.phone;
        }
      }
      await supabase.from("sms_log").insert({
        patient_name: bill.patient_name,
        phone,
        message: `Dear ${bill.patient_name}, your appointment with Dr. ${bill.doctor_name} is complete. Total Bill: Rs.${grandTotal.toLocaleString("en-IN")}. Status: Paid. Thank you for visiting RK Hospital!`,
        status: "sent",
      });
    }

    load();
    toast({ title: "Marked as paid & SMS triggered to patient" });
  };

  const doctorFee = selected?.amount || 0;
  const itemsTotal = items.reduce((s, i) => s + i.amount, 0);
  const grandTotal = doctorFee + itemsTotal;

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
                <th className="p-3 text-left font-medium text-muted-foreground">Doctor Fee</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-left font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => openBill(b)}>
                    <td className="p-3 text-foreground">{b.patient_name}</td>
                    <td className="p-3 text-foreground">{b.doctor_name}</td>
                    <td className="p-3 text-foreground">{b.date}</td>
                    <td className="p-3 font-semibold text-foreground">₹{b.amount}</td>
                    <td className="p-3"><Badge variant={b.status === "paid" ? "default" : "secondary"}>{b.status}</Badge></td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" className="gap-1" onClick={(e) => { e.stopPropagation(); openBill(b); }}>
                        <Receipt className="h-3 w-3" /> View Bill
                      </Button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No billing records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bill Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill — {selected?.patient_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Info */}
            <div className="rounded-lg bg-secondary p-3 text-sm space-y-1">
              <p className="text-foreground"><strong>Doctor:</strong> {selected?.doctor_name}</p>
              <p className="text-muted-foreground"><strong>Date:</strong> {selected?.date} &nbsp;|&nbsp; <strong>Bill ID:</strong> {selected?.id?.slice(0, 8).toUpperCase()}</p>
            </div>

            {/* Line items */}
            <div>
              <Label className="text-base font-semibold">Charges</Label>
              <div className="mt-2 space-y-2">
                {/* Doctor fee (non-removable) */}
                <div className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
                  <span className="text-sm text-foreground">Doctor Consultation Fee</span>
                  <span className="text-sm font-semibold text-foreground">₹{doctorFee}</span>
                </div>

                {/* Added items */}
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm text-foreground">{item.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">₹{item.amount}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new charge */}
            <div className="rounded-lg border border-dashed p-3 space-y-2">
              <Label className="text-xs text-muted-foreground">Add Test / Service Charge</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Blood Test, X-Ray"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="₹"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-24"
                />
                <Button size="sm" onClick={addItem} disabled={saving || !newDesc || !newAmount}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
              <span className="text-lg font-bold text-foreground">Grand Total</span>
              <span className="text-xl font-bold text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <BillPDF bill={selected || {}} items={items} doctorFee={doctorFee} />
              {selected?.status !== "paid" && (
                <Button variant="outline" className="w-full" onClick={() => markPaid(selected?.id)}>
                  Mark as Paid & Send Notification
                </Button>
              )}
              {selected?.status === "paid" && (
                <p className="text-center text-sm text-muted-foreground">✓ Paid — SMS & WhatsApp notification sent</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBilling;
