import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface BillItem {
  description: string;
  amount: number;
}

interface BillPDFProps {
  bill: {
    patient_name: string;
    doctor_name: string;
    date: string;
    id: string;
  };
  items: BillItem[];
  doctorFee: number;
}

const BillPDF = ({ bill, items, doctorFee }: BillPDFProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const totalItems = items.reduce((s, i) => s + i.amount, 0);
  const grandTotal = doctorFee + totalItems;

  const handlePrint = () => {
    const content = ref.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Bill - ${bill.patient_name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        .header { text-align: center; border-bottom: 3px solid #0ea5e9; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 28px; color: #0ea5e9; }
        .header p { color: #666; font-size: 13px; margin-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; font-size: 14px; }
        .info-grid span { color: #666; }
        .info-grid strong { color: #1a1a1a; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 13px; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .amount { text-align: right; font-variant-numeric: tabular-nums; }
        .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #0ea5e9; background: #f0f9ff; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <>
      <div ref={ref} style={{ position: "absolute", left: "-9999px" }}>
        <div className="header">
          <h1>RK Hospital</h1>
          <p>Mumbai, Maharashtra • Phone: +91 XXXXX XXXXX</p>
          <p style={{ marginTop: "4px", fontSize: "11px" }}>Bill / Invoice</p>
        </div>
        <div className="info-grid">
          <div><span>Patient: </span><strong>{bill.patient_name}</strong></div>
          <div><span>Date: </span><strong>{bill.date}</strong></div>
          <div><span>Doctor: </span><strong>{bill.doctor_name}</strong></div>
          <div><span>Bill ID: </span><strong>{bill.id.slice(0, 8).toUpperCase()}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th className="amount" style={{ textAlign: "right" }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Doctor Consultation Fee</td>
              <td className="amount" style={{ textAlign: "right" }}>{doctorFee.toLocaleString("en-IN")}</td>
            </tr>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{i + 2}</td>
                <td>{item.description}</td>
                <td className="amount" style={{ textAlign: "right" }}>{item.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={2}>Grand Total</td>
              <td className="amount" style={{ textAlign: "right" }}>₹{grandTotal.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
        <div className="footer">
          <p>Thank you for visiting RK Hospital. Get well soon!</p>
          <p style={{ marginTop: "4px" }}>This is a computer-generated bill.</p>
        </div>
      </div>
      <Button onClick={handlePrint} className="gap-2">
        <Printer className="h-4 w-4" /> Print Bill
      </Button>
    </>
  );
};

export default BillPDF;
