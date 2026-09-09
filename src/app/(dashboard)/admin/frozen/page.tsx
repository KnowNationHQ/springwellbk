"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogoSpinner } from "@/components/logo-spinner";
import { ArrowLeft, ArrowUpDown, Copy } from "lucide-react";
import { sym, displayDate } from "@/lib/format";
import { BankNav } from "@/components/layout/bank-nav";

export default function AdminFrozenTransfersPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const users = useQuery(api.users.list);
  const frozenTransfers = useQuery(api.admin.pendingFrozenTransfers);
  const generateTransferCodes = useMutation(api.admin.generateTransferCodes);
  const sendVerificationCodes = useAction(api.email.sendVerificationCodes);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  }

  async function handleSendCode(t: any) {
    if (!userId) return;
    const codeVal = (codeInputs[t._id] || "").trim();
    if (!codeVal) return;
    setGeneratingCodes(true);
    setErrorMsg("");
    try {
      const result = await generateTransferCodes({ adminUserId: userId as any, transactionId: t._id, code: codeVal });
      const sender = users?.find((u: any) => u._id === t.userId);
      let emailSent = false;
      if (sender?.email) {
        try {
          await sendVerificationCodes({ to: sender.email, firstName: sender.firstName, cotCode: result.label === "COT" ? result.code : "", bsacCode: result.label === "BSAC" ? result.code : "", vatCode: result.label === "VAT" ? result.code : "" });
          emailSent = true;
        } catch (e: any) {
          setErrorMsg(`Code saved but email failed: ${e?.message ?? "unknown error"}`);
        }
      }
      setCodeInputs((prev) => { const n = { ...prev }; delete n[t._id]; return n; });
      setSuccessMsg(emailSent ? `${result.label} code sent to ${sender?.email ?? "customer"}` : `${result.label} code saved (email delivery failed)`);
      setTimeout(() => { setSuccessMsg(""); setErrorMsg(""); }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Failed");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setGeneratingCodes(false);
    }
  }

  if (!userId || users === undefined || frozenTransfers === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><LogoSpinner /></div>;
  }

  const adminUser = users.find((u: any) => u._id === userId);
  if (!adminUser || adminUser.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {adminUser && <BankNav user={{ firstName: adminUser.firstName, lastName: adminUser.lastName, email: adminUser.email, imageId: adminUser.imageId }} role="admin" />}

      <main className="max-w-[800px] mx-auto px-4 py-4 space-y-4">
        <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-[#426FB6] text-sm font-semibold bg-transparent border-none cursor-pointer p-0">
          <ArrowLeft size={16} /> Back to Admin
        </button>

        <h1 className="text-lg font-bold text-gray-900 m-0">Frozen Transfers ({frozenTransfers.length})</h1>

        {successMsg && (
          <div className="bg-[#426FB6] text-white text-sm font-semibold px-4 py-2 rounded-lg">{successMsg}</div>
        )}
        {errorMsg && (
          <div className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">{errorMsg}</div>
        )}

        {frozenTransfers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm m-0">No frozen transfers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {frozenTransfers.map((t: any) => {
              const sender = users?.find((u: any) => u._id === t.userId);
              const feeLabel = t.feeStatus === "pending_cot" ? "Awaiting COT" : t.feeStatus === "pending_bsac" ? "COT verified" : t.feeStatus === "pending_vat" ? "BSAC verified" : "Completed";
              return (
                <div key={t._id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center"><ArrowUpDown className="w-3.5 h-3.5 text-orange-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 m-0">{sym(t.currency)}{t.amount.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 m-0">{sender?.firstName} {sender?.lastName} · {displayDate(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {displayDate(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1 ${t.type === "credit" ? "bg-green-100 text-green-700" : t.type === "debit" ? "bg-red-100 text-red-700" : t.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.type === "credit" ? "Credited" : t.type === "debit" ? "Debited" : t.status === "pending" ? "Pending" : "Transfer"}</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{feeLabel}</span>
                    </div>
                  </div>

                  {t.cotCode && (
                    <div className="flex gap-1.5 text-[11px] font-mono text-gray-500 flex-wrap mb-2">
                      {t.cotCode && <span className="inline-flex items-center gap-1">COT: <strong className="text-gray-900">{t.cotCode}</strong><button onClick={() => copyCode(t.cotCode)} className="p-1 rounded hover:bg-gray-200 transition-colors" title="Copy COT code"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>{copiedCode === t.cotCode && <span className="text-green-600 text-[11px] font-sans">Copied!</span>}</span>}
                      {t.bsacCode && <><span>·</span><span className="inline-flex items-center gap-1">BSAC: <strong className="text-gray-900">{t.bsacCode}</strong><button onClick={() => copyCode(t.bsacCode)} className="p-1 rounded hover:bg-gray-200 transition-colors" title="Copy BSAC code"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>{copiedCode === t.bsacCode && <span className="text-green-600 text-[11px] font-sans">Copied!</span>}</span></>}
                      {t.vatCode && <><span>·</span><span className="inline-flex items-center gap-1">VAT: <strong className="text-gray-900">{t.vatCode}</strong><button onClick={() => copyCode(t.vatCode)} className="p-1 rounded hover:bg-gray-200 transition-colors" title="Copy VAT code"><Copy className="w-3.5 h-3.5 text-gray-400" /></button>{copiedCode === t.vatCode && <span className="text-green-600 text-[11px] font-sans">Copied!</span>}</span></>}
                    </div>
                  )}

                    {(!t.vatCode) && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Enter ${!t.cotCode ? "COT" : !t.bsacCode ? "BSAC" : "VAT"} code`}
                          value={codeInputs[t._id] || ""}
                          onChange={(e) => setCodeInputs((prev) => ({ ...prev, [t._id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSendCode(t); }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:border-[#426FB6] transition-colors"
                        />
                        <button
                          onClick={() => handleSendCode(t)}
                          disabled={generatingCodes || !(codeInputs[t._id] || "").trim()}
                          className="px-4 py-2 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer"
                          style={{ opacity: generatingCodes || !(codeInputs[t._id] || "").trim() ? 0.5 : 1 }}
                        >
                          {generatingCodes ? "Sending..." : "Send Code"}
                        </button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
