"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { X, Download, CheckCircle, ArrowUpRight, ArrowDownLeft, Minus } from "lucide-react";
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
      const canvas = await html2canvas(el, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `receipt-${refId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Receipt download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 m-0">Transaction Receipt</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={receiptRef} className="p-5">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#426FB6] mb-2">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <p className="text-sm font-bold text-gray-900 m-0">SpringWell Bank</p>
            <p className="text-[11px] text-gray-400 m-0">Transaction Receipt</p>
          </div>

          {/* Status */}
          <div className={`flex items-center justify-center gap-2 py-2.5 rounded-lg mb-5 ${t.status === "successful" ? "bg-green-50" : t.status === "pending" ? "bg-yellow-50" : "bg-red-50"}`}>
            {t.status === "successful" ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Minus className="w-4 h-4 text-gray-400" />}
            <span className={`text-xs font-semibold capitalize ${t.status === "successful" ? "text-green-700" : t.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{t.status}</span>
          </div>

          {/* Amount */}
          <div className="text-center mb-5">
            <p className="text-[11px] text-gray-400 m-0 uppercase tracking-wider">Amount</p>
            <p className={`text-2xl font-bold m-0 mt-1 ${isCredit ? "text-green-600" : "text-gray-900"}`}>
              {isCredit ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-5">
            {[
              { label: "Type", value: t.type === "credit" ? "Credit" : t.type === "debit" ? "Debit" : "Transfer" },
              { label: "Description", value: t.description || "—" },
              { label: "Date", value: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
              { label: "Time", value: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) },
              { label: "From", value: t.senderName || user.firstName + " " + user.lastName },
              { label: "Account", value: user.email },
              { label: "Reference", value: refId },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-start">
                <span className="text-xs text-gray-400">{row.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right max-w-[60%]">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-3 text-center">
            <p className="text-[10px] text-gray-300 m-0">SpringWell Bank &middot; This receipt is auto-generated.</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="px-5 pb-5">
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
