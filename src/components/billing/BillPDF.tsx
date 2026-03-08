import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
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
  const today = new Date().toLocaleDateString("en-IN");

  const handleDownloadPDF = async () => {
    const element = ref.current;
    if (!element) return;

    setGenerating(true);
    try {
      // Temporarily make visible for rendering
      element.style.position = "fixed";
      element.style.left = "0";
      element.style.top = "0";
      element.style.zIndex = "-1";
      element.style.opacity = "1";
      element.style.width = "794px"; // A4 width at 96dpi

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Restore hidden
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.opacity = "0";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let remainingHeight = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      remainingHeight -= pdfHeight;

      while (remainingHeight > 0) {
        position = remainingHeight - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remainingHeight -= pdfHeight;
      }

      pdf.save(`RK-Hospital-Bill-${billId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden bill layout for PDF rendering */}
      <div ref={ref} style={{ position: "absolute", left: "-9999px", opacity: 0 }}>
        <div style={{
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          padding: "40px",
          color: "#1a1a1a",
          backgroundColor: "#ffffff",
          minHeight: "1100px",
        }}>
          {/* Hospital Header */}
          <div style={{ textAlign: "center", borderBottom: "3px double #0c4a6e", paddingBottom: "20px", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", color: "#dc2626", fontWeight: 600, letterSpacing: "2px", marginBottom: "4px" }}>
              ✚
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#0c4a6e", margin: 0, letterSpacing: "1px" }}>
              RK HOSPITAL
            </h1>
            <p style={{ color: "#64748b", fontSize: "12px", marginTop: "6px", letterSpacing: "0.5px" }}>
              Multi-Speciality Hospital & Diagnostic Centre
            </p>
            <p style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
              Mumbai, Maharashtra • Phone: +91 XXXXX XXXXX • Email: info@rkhospital.com
            </p>
            <div style={{
              display: "inline-block",
              marginTop: "12px",
              background: "#0c4a6e",
              color: "#ffffff",
              padding: "4px 20px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "2px",
              borderRadius: "2px",
            }}>
              BILL / INVOICE
            </div>
          </div>

          {/* Bill Info Row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            fontSize: "12px",
            color: "#475569",
          }}>
            <div>
              <span style={{ fontWeight: 600 }}>Bill No: </span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0c4a6e" }}>{billId}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600 }}>Date: </span>
              <span>{bill.date || today}</span>
            </div>
          </div>

          {/* Patient & Doctor Details */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "28px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            overflow: "hidden",
          }}>
            <div style={{ padding: "16px", borderRight: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "8px" }}>
                Patient Details
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{bill.patient_name}</div>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "8px" }}>
                Attending Doctor
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>{bill.doctor_name}</div>
            </div>
          </div>

          {/* Charges Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0" }}>
            <thead>
              <tr>
                <th style={{
                  background: "#0c4a6e", color: "#ffffff", textAlign: "left",
                  padding: "10px 14px", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.5px", width: "50px",
                }}>S.No</th>
                <th style={{
                  background: "#0c4a6e", color: "#ffffff", textAlign: "left",
                  padding: "10px 14px", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.5px",
                }}>Description</th>
                <th style={{
                  background: "#0c4a6e", color: "#ffffff", textAlign: "right",
                  padding: "10px 14px", fontSize: "11px", fontWeight: 700,
                  letterSpacing: "0.5px", width: "140px",
                }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#f8fafc" }}>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>1</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>Doctor Consultation Fee</td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {doctorFee.toLocaleString("en-IN")}
                </td>
              </tr>
              {items.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>{i + 2}</td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>{item.description}</td>
                  <td style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", fontSize: "13px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {item.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ borderTop: "2px solid #0c4a6e", marginBottom: "32px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px", background: "#f0f9ff",
              borderBottom: "1px solid #e2e8f0",
            }}>
              <span style={{ fontSize: "13px", color: "#475569" }}>Sub Total (Tests & Services)</span>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>₹{totalItems.toLocaleString("en-IN")}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px", background: "#f0f9ff",
              borderBottom: "1px solid #e2e8f0",
            }}>
              <span style={{ fontSize: "13px", color: "#475569" }}>Doctor Fee</span>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>₹{doctorFee.toLocaleString("en-IN")}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "16px 14px", background: "#0c4a6e",
            }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.5px" }}>GRAND TOTAL</span>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "40px", padding: "12px 16px",
            border: `2px solid ${bill.status === "paid" ? "#16a34a" : "#f59e0b"}`,
            borderRadius: "6px",
            background: bill.status === "paid" ? "#f0fdf4" : "#fffbeb",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: bill.status === "paid" ? "#16a34a" : "#d97706" }}>
              Payment Status
            </span>
            <span style={{
              fontSize: "14px", fontWeight: 800,
              color: bill.status === "paid" ? "#16a34a" : "#d97706",
              textTransform: "uppercase" as const,
              letterSpacing: "1px",
            }}>
              {bill.status === "paid" ? "✓ PAID" : "⏳ PENDING"}
            </span>
          </div>

          {/* Signature Area */}
          <div style={{
            display: "flex", justifyContent: "space-between", marginBottom: "40px",
            paddingTop: "20px",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #94a3b8", width: "180px", paddingTop: "8px" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Patient / Attendant Signature</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #94a3b8", width: "180px", paddingTop: "8px" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Authorized Signatory</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: "center", borderTop: "1px solid #e2e8f0",
            paddingTop: "16px",
          }}>
            <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
              Thank you for choosing RK Hospital. We wish you a speedy recovery!
            </p>
            <p style={{ fontSize: "10px", color: "#cbd5e1" }}>
              This is a computer-generated invoice and does not require a physical signature.
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleDownloadPDF} disabled={generating} className="gap-2 w-full">
        <Download className="h-4 w-4" /> {generating ? "Generating..." : "Download Bill PDF"}
      </Button>
    </>
  );
};

export default BillPDF;
