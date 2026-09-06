"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, ArrowRightLeft, User, Loader2, Building2 } from "lucide-react";
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

  const [domesticForm, setDomesticForm] = useState({ recipientName: "", bankName: "", routingNumber: "", accountNumber: "", recipientAccount: "", amount: "", description: "" });
  const [intlForm, setIntlForm] = useState({
    recipientName: "",
    recipientBank: "",
    routingNumber: "",
    accountNumber: "",
    iban: "",
    swiftCode: "",
    amount: "",
    currency: "USD",
    description: "",
  });
  const [businessForm, setBusinessForm] = useState({ businessName: "", accountNumber: "", amount: "", description: "" });

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

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
    setLoading(true);
    try {
      const desc = `Domestic transfer to ${domesticForm.recipientName} at ${domesticForm.bankName}${domesticForm.routingNumber ? ` (Routing: ${domesticForm.routingNumber})` : ""}${domesticForm.description ? ` — ${domesticForm.description}` : ""}`;
      await transfer({ fromUserId: userId as any, toEmail: recipient.email, amount: amt, description: desc });
      setSuccess(`$${amt.toLocaleString()} transferred to ${domesticForm.recipientName} at ${domesticForm.bankName}`);
      setDomesticForm({ recipientName: "", bankName: "", routingNumber: "", accountNumber: "", amount: "", description: "" });
    } catch (err: any) {
      setError(err.message || "Transfer failed");
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
    setLoading(true);
    try {
      await transfer({
        fromUserId: userId as any,
        toEmail: "admin@springwellbk.com",
        amount: amt,
        description: `International wire to ${intlForm.recipientName} at ${intlForm.recipientBank}${intlForm.swiftCode ? ` (SWIFT: ${intlForm.swiftCode})` : ""}${intlForm.iban ? ` (IBAN: ${intlForm.iban})` : ""}`,
      });
      setSuccess(`International transfer of $${amt.toLocaleString()} to ${intlForm.recipientName} has been submitted. Processing takes 1-3 business days.`);
      setIntlForm({ recipientName: "", recipientBank: "", routingNumber: "", accountNumber: "", iban: "", swiftCode: "", amount: "", currency: "USD", description: "" });
    } catch (err: any) {
      setError(err.message || "Transfer failed");
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
    setLoading(true);
    try {
      await transfer({
        fromUserId: userId as any,
        toEmail: recipient.email,
        amount: amt,
        description: businessForm.description || `Business payment to ${businessForm.businessName}`,
      });
      setSuccess(`$${amt.toLocaleString()} sent to ${businessForm.businessName}`);
      setBusinessForm({ businessName: "", accountNumber: "", amount: "", description: "" });
    } catch (err: any) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
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
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#426FB6" }} />
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
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} style={{ color: "#ca8a04" }} />
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
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={20} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={18} style={{ color: "#999" }} />
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={20} style={{ color: "#426FB6" }} />
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
                <div className="form-row">
                  <div>
                    <Label htmlFor="dom-bank" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Bank Name *</Label>
                    <Input id="dom-bank" required placeholder="e.g. Chase, Bank of America" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.bankName} onChange={(e) => setDomesticForm({ ...domesticForm, bankName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="dom-routing" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Routing Number</Label>
                    <Input id="dom-routing" placeholder="9-digit routing number" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.routingNumber} onChange={(e) => setDomesticForm({ ...domesticForm, routingNumber: e.target.value })} />
                  </div>
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
                <div className="form-row">
                  <div>
                    <Label htmlFor="intl-routing" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Routing Number</Label>
                    <Input id="intl-routing" placeholder="ABA / Routing" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.routingNumber} onChange={(e) => setIntlForm({ ...intlForm, routingNumber: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-account" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Account Number</Label>
                    <Input id="intl-account" placeholder="Account number" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.accountNumber} onChange={(e) => setIntlForm({ ...intlForm, accountNumber: e.target.value })} />
                  </div>
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
    </div>
  );
}
