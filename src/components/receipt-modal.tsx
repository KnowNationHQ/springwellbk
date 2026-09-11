"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X, Download, CheckCircle, Minus } from "lucide-react";
import { sym, displayDate } from "@/lib/format";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  transaction: {
    _id: string;
    type: "credit" | "debit" | "transfer";
    amount: number;
    currency: string;
    description?: string;
    senderName?: string;
    status: string;
    createdAt: number;
    backDate?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    accountNumber?: string;
  };
}

export function ReceiptModal({ open, onClose, transaction: t, user }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const date = displayDate(t);
  const refId = "SWB-" + t._id.slice(-10).toUpperCase();
  const isCredit = t.type === "credit";

  async function handleDownload() {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const el = receiptRef.current;
      await document.fonts.ready;
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${refId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download failed:", err);
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6" onClick={onClose}>
      <div className="w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 m-0">Transaction Receipt</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Everything inside receiptRef gets captured as image */}
        <div ref={receiptRef} className="bg-white">
          {/* Amount header */}
          <div className={`px-6 pt-6 pb-5 ${t.status === "successful" ? "bg-green-50" : t.status === "pending" ? "bg-yellow-50" : "bg-red-50"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#426FB6] flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">SpringWell Bank</span>
            </div>
            <div className="text-center">
              <p className={`text-3xl sm:text-4xl font-bold m-0 ${isCredit ? "text-green-600" : "text-gray-900"}`}>
                {isCredit ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {t.status === "successful" ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Minus className="w-3.5 h-3.5 text-gray-400" />}
                <span className={`text-xs font-semibold capitalize ${t.status === "successful" ? "text-green-700" : t.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{t.status}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Type", value: t.type === "credit" ? "Credit" : t.type === "debit" ? "Debit" : "Transfer" },
                { label: "Reference", value: refId },
                { label: "Date", value: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
                { label: "Time", value: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) },
                { label: "From", value: t.senderName || user.firstName + " " + user.lastName },
                { label: "Account", value: user.email },
                { label: "Description", value: t.description || "—" },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-[10px] text-gray-400 m-0 uppercase tracking-wider">{row.label}</p>
                  <p className="text-sm font-medium text-gray-800 m-0 mt-0.5 break-words">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 mt-5 text-center">
              <p className="text-[10px] text-gray-300 m-0">SpringWell Bank &middot; This receipt is auto-generated.</p>
            </div>
          </div>
        </div>

        {/* Download Button (outside receiptRef) */}
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#426FB6] hover:bg-[#3560a0] text-white border-none rounded-lg text-sm font-bold cursor-pointer transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating..." : "Download Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
