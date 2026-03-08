import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    status?: string;
  };
  items: BillItem[];
  doctorFee: number;
}

const BillPDF = ({ bill, items, doctorFee }: BillPDFProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const totalItems = items.reduce((s, i) => s + i.amount, 0);
  const grandTotal = doctorFee + totalItems;
  const billId = bill.id ? bill.id.slice(0, 8).toUpperCase() : "N/A";

  const handlePrint = async () => {
    if (!ref.current) return;
    setGenerating(true);
    try {
      ref.current.style.position = "fixed";
      ref.current.style.left = "0";
      ref.current.style.top = "0";
      ref.current.style.zIndex = "-1";
      ref.current.style.opacity = "1";
      ref.current.style.width = "794px";

      const canvas = await html2canvas(ref.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      ref.current.style.position = "absolute";
      ref.current.style.left = "-9999px";
      ref.current.style.opacity = "0";

      const imgData = canvas.toDataURL("image/jpeg", 0.6);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= 277;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= 277;
      }

      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div ref={ref} style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
        <div style={{
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "32px 40px",
          color: "#000000",
          backgroundColor: "#ffffff",
          fontSize: "13px",
          lineHeight: "1.5",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "12px", marginBottom: "16px" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "1px" }}>RK HOSPITAL</div>
            <div style={{ fontSize: "11px", color: "#333", marginTop: "2px" }}>Multi-Speciality Hospital & Diagnostic Centre</div>
            <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>Mumbai, Maharashtra • Ph: +91 XXXXX XXXXX</div>
            <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "8px", letterSpacing: "2px" }}>BILL / INVOICE</div>
          </div>

          {/* Bill Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "12px" }}>
            <div><strong>Bill No:</strong> {billId}</div>
            <div><strong>Date:</strong> {bill.date}</div>
          </div>

          {/* Patient/Doctor */}
          <div style={{ border: "1px solid #000", marginBottom: "16px", fontSize: "12px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "8px 12px", borderRight: "1px solid #000" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>PATIENT</div>
                <div style={{ fontWeight: 700 }}>{bill.patient_name}</div>
              </div>
              <div style={{ flex: 1, padding: "8px 12px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, marginBottom: "4px" }}>DOCTOR</div>
                <div style={{ fontWeight: 700 }}>{bill.doctor_name}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0", fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "left", fontWeight: 700, width: "40px" }}>S.No</th>
                <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "left", fontWeight: 700 }}>Description</th>
                <th style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right", fontWeight: 700, width: "120px" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #000", padding: "6px 10px" }}>1</td>
                <td style={{ border: "1px solid #000", padding: "6px 10px" }}>Consultation Fee</td>
                <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right" }}>{doctorFee.toLocaleString("en-IN")}.00</td>
              </tr>
              {items.map((item, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{i + 2}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{item.description}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", textAlign: "right" }}>{item.amount.toLocaleString("en-IN")}.00</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ border: "1px solid #000", padding: "8px 10px", textAlign: "right", fontWeight: 700, fontSize: "14px" }}>
                  GRAND TOTAL
                </td>
                <td style={{ border: "1px solid #000", padding: "8px 10px", textAlign: "right", fontWeight: 700, fontSize: "14px" }}>
                  ₹{grandTotal.toLocaleString("en-IN")}.00
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Status */}
          <div style={{ marginTop: "16px", fontSize: "12px" }}>
            <strong>Payment Status: </strong>
            <span>{bill.status === "paid" ? "PAID" : "PENDING"}</span>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "60px", fontSize: "11px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #000", width: "160px", paddingTop: "4px" }}>Patient / Attendant</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #000", width: "160px", paddingTop: "4px" }}>Authorized Signatory</div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "32px", fontSize: "10px", color: "#666", borderTop: "1px solid #999", paddingTop: "8px" }}>
            <div>Thank you for visiting RK Hospital. Get well soon!</div>
            <div>Computer generated bill — does not require signature.</div>
          </div>
        </div>
      </div>

      <Button onClick={handlePrint} disabled={generating} className="gap-2 w-full">
        <Printer className="h-4 w-4" /> {generating ? "Generating..." : "Print Bill"}
      </Button>
    </>
  );
};

export default BillPDF;
