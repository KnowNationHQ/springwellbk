"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { sym } from "@/lib/format";
import { BankNav } from "@/components/layout/bank-nav";

export default function PendingVerificationPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [verifyTxn, setVerifyTxn] = useState<any>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const users = useQuery(api.users.list);
  const frozenTransfers = useQuery(api.auth.getMyFrozenTransfers, userId ? { userId: userId as any } : "skip");
  const myPending = useQuery(api.auth.getMyPendingTransactions, userId ? { userId: userId as any } : "skip");
  const verifyTransferCode = useMutation(api.auth.verifyTransferCode);
  const customerCompleteTransaction = useMutation(api.auth.customerCompleteTransaction);

  if (!userId || users === undefined || frozenTransfers === undefined || myPending === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  const user = users.find((u: any) => u._id === userId);
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">User not found</p></div>;

  function acct(t: any) { return "SWB-" + t._id.slice(-8).toUpperCase(); }

  async function handleVerify(txn: any, codeType: string, codeValue: string) {
    if (!codeValue.trim()) return;
    setLoading(true); setError(""); setSuccess("");
    try {
      await verifyTransferCode({ transactionId: txn._id, codeType: codeType as any, code: codeValue.trim(), userId: userId as any });
      setSuccess(`${codeType.toUpperCase()} verified!`);
      setCode(""); setVerifyTxn(null);
    } catch (err: any) { setError(err?.message ?? "Failed"); }
    setLoading(false);
  }

  async function handlePendingComplete(txn: any) {
    setLoading(true); setError(""); setSuccess("");
    try {
      await customerCompleteTransaction({ userId: userId as any, transactionId: txn._id, activationCode: code.trim() });
      setSuccess("Transfer completed!");
      setCode(""); setVerifyTxn(null);
    } catch (err: any) { setError(err?.message ?? "Failed"); }
    setLoading(false);
  }

  function nextCodeType(tx: any) {
    if (tx.feeStatus === "pending_cot") return "cot";
    if (tx.feeStatus === "pending_bsac") return "bsac";
    if (tx.feeStatus === "pending_vat") return "vat";
    return null;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <BankNav user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, imageId: user.imageId }} role="customer" />

      <main className="max-w-[600px] mx-auto px-4 py-4 space-y-4">
        <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-[#426FB6] text-sm font-semibold bg-transparent border-none cursor-pointer p-0">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-lg font-bold text-gray-900 m-0">Pending Verification</h1>

        {frozenTransfers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 m-0">Frozen Transfers ({frozenTransfers.length})</h3>
            </div>
            <div className="p-4 space-y-2">
              {frozenTransfers.map((tx: any) => {
                const next = nextCodeType(tx);
                return (
                  <div key={tx._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="text-sm font-bold text-gray-900 m-0">{sym(tx.currency)}{tx.amount.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 m-0">{tx.description || tx.type}</p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {tx.feeStatus === "pending_cot" ? "Awaiting COT" : tx.feeStatus === "pending_bsac" ? "COT verified" : tx.feeStatus === "pending_vat" ? "BSAC verified" : "Completed"}
                      </span>
                    </div>
                    {next && (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          placeholder={`Enter ${next.toUpperCase()} code`}
                          value={verifyTxn?._id === tx._id ? code : ""}
                          onFocus={() => { setVerifyTxn(tx); setCode(""); setError(""); setSuccess(""); }}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleVerify(tx, next, code); }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6]"
                        />
                        <button
                          onClick={() => handleVerify(tx, next, code)}
                          disabled={loading || !code.trim() || verifyTxn?._id !== tx._id}
                          className="px-4 py-2 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer"
                          style={{ opacity: loading || !code.trim() || verifyTxn?._id !== tx._id ? 0.5 : 1 }}
                        >
                          {loading ? "Verifying..." : "Verify"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {myPending && myPending.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 m-0">Pending Transactions ({myPending.length})</h3>
            </div>
            <div className="p-4 space-y-2">
              {myPending.map((tx: any) => (
                <div key={tx._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-bold text-gray-900 m-0">{sym(tx.currency)}{tx.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-400 m-0">{tx.description || tx.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter activation code"
                      value={verifyTxn?._id === tx._id ? code : ""}
                      onFocus={() => { setVerifyTxn(tx); setCode(""); setError(""); setSuccess(""); }}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handlePendingComplete(tx); }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6]"
                    />
                    <button
                      onClick={() => handlePendingComplete(tx)}
                      disabled={loading || !code.trim() || verifyTxn?._id !== tx._id}
                      className="px-4 py-2 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer"
                      style={{ opacity: loading || !code.trim() || verifyTxn?._id !== tx._id ? 0.5 : 1 }}
                    >
                      {loading ? "Completing..." : "Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {frozenTransfers.length === 0 && myPending?.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm m-0">No pending transactions.</p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm m-0">{error}</p>}
        {success && <p className="text-[#426FB6] text-sm m-0">{success}</p>}
      </main>
    </div>
  );
}
