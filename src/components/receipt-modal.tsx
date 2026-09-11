"use client";

import { useState } from "react";
import Image from "next/image";
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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function drawReceipt(t: ReceiptModalProps["transaction"], user: ReceiptModalProps["user"]): Promise<Blob | null> {
  const W = 400;
  const H = 580;
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);

  const date = displayDate(t);
  const refId = "SWB-" + t._id.slice(-10).toUpperCase();
  const isCredit = t.type === "credit";
  const amount = `${isCredit ? "+" : "-"}${sym(t.currency)}${t.amount.toLocaleString()}`;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Blue header
  ctx.fillStyle = "#426FB6";
  ctx.fillRect(0, 0, W, 90);

  // Draw logo
  try {
    const logo = await loadImage("/logo-white.svg");
    ctx.drawImage(logo, 20, 22, 140, 28);
  } catch {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("SpringWell Bank", 20, 42);
  }

  // Date top right
  ctx.textAlign = "right";
  ctx.font = "10px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), W - 20, 38);
  ctx.fillText(date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), W - 20, 52);

  // "Transaction Receipt" subtitle
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "10px sans-serif";
  ctx.fillText("TRANSACTION RECEIPT", 20, 68);

  // Amount section
  const amtY = 104;
  ctx.textAlign = "center";
  ctx.fillStyle = t.status === "successful" ? "#f0fdf4" : t.status === "pending" ? "#fefce8" : "#fef2f2";
  ctx.beginPath();
  ctx.roundRect(20, amtY, W - 40, 72, 8);
  ctx.fill();

  ctx.fillStyle = isCredit ? "#16a34a" : "#111827";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(amount, W / 2, amtY + 38);

  ctx.fillStyle = t.status === "successful" ? "#16a34a" : t.status === "pending" ? "#a16207" : "#dc2626";
  ctx.font = "600 11px sans-serif";
  ctx.fillText(t.status.toUpperCase(), W / 2, amtY + 58);

  // Divider
  const divY = amtY + 88;
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, divY);
  ctx.lineTo(W - 20, divY);
  ctx.stroke();

  // Details
  const details = [
    ["Type", t.type === "credit" ? "Credit" : t.type === "debit" ? "Debit" : "Transfer"],
    ["Reference", refId],
    ["Date", date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })],
    ["Time", date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })],
    ["From", t.senderName || `${user.firstName} ${user.lastName}`],
    ["Account", user.email],
    ["Description", t.description || "—"],
  ];

  let y = divY + 28;
  ctx.textAlign = "left";
  for (const [label, value] of details) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "9px sans-serif";
    ctx.fillText(label.toUpperCase(), 28, y);
    ctx.fillStyle = "#1f2937";
    ctx.font = "12px sans-serif";
    const maxW = W - 56;
    let displayVal = value;
    while (ctx.measureText(displayVal).width > maxW && displayVal.length > 3) {
      displayVal = displayVal.slice(0, -4) + "...";
    }
    ctx.fillText(displayVal, 28, y + 16);
    y += 38;
  }

  // Footer divider
  ctx.strokeStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(20, y + 6);
  ctx.lineTo(W - 20, y + 6);
  ctx.stroke();

  // Footer
  ctx.fillStyle = "#d1d5db";
  ctx.font = "9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SpringWell Bank · This receipt is auto-generated.", W / 2, y + 26);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

export function ReceiptModal({ open, onClose, transaction: t, user }: ReceiptModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const date = displayDate(t);
  const refId = "SWB-" + t._id.slice(-10).toUpperCase();
  const isCredit = t.type === "credit";

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await drawReceipt(t, user);
      if (!blob) throw new Error("Canvas failed");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-900 m-0">Transaction Receipt</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt preview */}
        <div className="p-4">
          {/* Amount header */}
          <div className={`px-4 pt-4 pb-3 rounded-xl mb-3 ${t.status === "successful" ? "bg-green-50" : t.status === "pending" ? "bg-yellow-50" : "bg-red-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logo.svg" alt="SpringWell Bank" width={100} height={20} priority className="h-5 w-auto" />
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold m-0 ${isCredit ? "text-green-600" : "text-gray-900"}`}>
                {isCredit ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                {t.status === "successful" ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Minus className="w-3 h-3 text-gray-400" />}
                <span className={`text-[11px] font-semibold capitalize ${t.status === "successful" ? "text-green-700" : t.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>{t.status}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            {[
              { label: "Type", value: t.type === "credit" ? "Credit" : t.type === "debit" ? "Debit" : "Transfer" },
              { label: "Reference", value: refId },
              { label: "Date", value: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
              { label: "Time", value: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) },
              { label: "From", value: t.senderName || user.firstName + " " + user.lastName },
              { label: "Account", value: user.email },
              { label: "Description", value: t.description || "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-start gap-4">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0">{row.label}</span>
                <span className="text-xs font-medium text-gray-800 text-right break-words">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-2.5 mt-3 text-center">
            <p className="text-[9px] text-gray-300 m-0">SpringWell Bank &middot; This receipt is auto-generated.</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#426FB6] hover:bg-[#3560a0] text-white border-none rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Generating..." : "Download Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
