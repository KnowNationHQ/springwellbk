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
import { DashboardFooter } from "@/components/layout/dashboard-footer";

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

  const [domesticForm, setDomesticForm] = useState({ toEmail: "", amount: "", description: "" });
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
  const [businessForm, setBusinessForm] = useState({ businessName: "", businessEmail: "", amount: "", description: "" });

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
    if (!domesticForm.toEmail || isNaN(amt) || amt <= 0) { setError("Enter a valid recipient email and amount"); return; }
    if (amt > (currentUser?.balance ?? 0)) { setError("Insufficient funds"); return; }
    setLoading(true);
    try {
      await transfer({ fromUserId: userId as any, toEmail: domesticForm.toEmail, amount: amt, description: domesticForm.description || undefined });
      setSuccess(`$${amt.toLocaleString()} transferred successfully to ${domesticForm.toEmail}`);
      setDomesticForm({ toEmail: "", amount: "", description: "" });
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
        toEmail: `wire-${intlForm.recipientName.toLowerCase().replace(/\s+/g, ".")}@springwellbk.com`,
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
    if (!businessForm.businessEmail || isNaN(amt) || amt <= 0) { setError("Enter a valid business email and amount"); return; }
    if (amt > (currentUser?.balance ?? 0)) { setError("Insufficient funds"); return; }
    setLoading(true);
    try {
      await transfer({
        fromUserId: userId as any,
        toEmail: businessForm.businessEmail,
        amount: amt,
        description: businessForm.description || `Payment to ${businessForm.businessName}`,
      });
      setSuccess(`$${amt.toLocaleString()} sent to ${businessForm.businessName || businessForm.businessEmail}`);
      setBusinessForm({ businessName: "", businessEmail: "", amount: "", description: "" });
    } catch (err: any) {
      setError(err.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: "#eee", minHeight: "100vh", fontFamily: "'Hind', Arial, sans-serif" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 30 }}>
              {/* Domestic */}
              <div
                onClick={() => setTransferType("domestic")}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: "30px 20px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 220,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#000", margin: "0 0 8px" }}>Domestic Bank Transfer</h3>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={22} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={20} style={{ color: "#999" }} />
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={22} style={{ color: "#426FB6" }} />
                  </div>
                </div>
              </div>

              {/* International */}
              <div
                onClick={() => setTransferType("international")}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: "30px 20px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 220,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>International Bank Transfer</h3>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={22} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={20} style={{ color: "#999" }} />
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={22} style={{ color: "#ca8a04" }} />
                  </div>
                </div>
              </div>

              {/* Business */}
              <div
                onClick={() => setTransferType("business")}
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: "30px 20px 20px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 220,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#000", margin: "0 0 8px", lineHeight: 1.3 }}>To someone else or a business</h3>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Landmark size={22} style={{ color: "#426FB6" }} />
                  </div>
                  <ArrowRightLeft size={20} style={{ color: "#999" }} />
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={22} style={{ color: "#426FB6" }} />
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
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Transfer to another SpringWell user by email</p>
                <div>
                  <Label htmlFor="dom-to" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Email *</Label>
                  <Input id="dom-to" type="email" required placeholder="friend@springwellbk.com" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.toEmail} onChange={(e) => setDomesticForm({ ...domesticForm, toEmail: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dom-amount" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount (USD) *</Label>
                  <Input id="dom-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.amount} onChange={(e) => setDomesticForm({ ...domesticForm, amount: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="dom-desc" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Description</Label>
                  <Input id="dom-desc" placeholder="What's this for?" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={domesticForm.description} onChange={(e) => setDomesticForm({ ...domesticForm, description: e.target.value })} />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  <Button type="submit" disabled={loading} style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-name" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Name *</Label>
                    <Input id="intl-name" required placeholder="Full name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.recipientName} onChange={(e) => setIntlForm({ ...intlForm, recipientName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-bank" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Bank Name *</Label>
                    <Input id="intl-bank" required placeholder="Bank name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.recipientBank} onChange={(e) => setIntlForm({ ...intlForm, recipientBank: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-routing" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Routing Number</Label>
                    <Input id="intl-routing" placeholder="ABA / Routing" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.routingNumber} onChange={(e) => setIntlForm({ ...intlForm, routingNumber: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-account" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Account Number</Label>
                    <Input id="intl-account" placeholder="Account number" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.accountNumber} onChange={(e) => setIntlForm({ ...intlForm, accountNumber: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-iban" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>IBAN</Label>
                    <Input id="intl-iban" placeholder="GB29NWBK60161331926819" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.iban} onChange={(e) => setIntlForm({ ...intlForm, iban: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="intl-swift" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>SWIFT / BIC Code</Label>
                    <Input id="intl-swift" placeholder="NWBKGB2L" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.swiftCode} onChange={(e) => setIntlForm({ ...intlForm, swiftCode: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-amount" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount *</Label>
                    <Input id="intl-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={intlForm.amount} onChange={(e) => setIntlForm({ ...intlForm, amount: e.target.value })} />
                  </div>
                  <div>
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
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  <Button type="submit" disabled={loading} style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
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
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Send money to another person or business</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="biz-name" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Business / Recipient Name *</Label>
                    <Input id="biz-name" required placeholder="Business or person name" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.businessName} onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="biz-email" style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient Email *</Label>
                    <Input id="biz-email" type="email" required placeholder="recipient@email.com" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={businessForm.businessEmail} onChange={(e) => setBusinessForm({ ...businessForm, businessEmail: e.target.value })} />
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
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                  <button type="button" onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                  <Button type="submit" disabled={loading} style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {loading ? "Sending..." : "Send Payment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DashboardFooter />
      </div>

      {/* Minimal footer */}
      <div className="bg-[#eee] border-t border-gray-300">
        <div className="max-w-[600px] mx-auto py-10 px-5 text-center">
          <p className="text-[13px] text-gray-500 m-0 mb-1">Phone +44 7445 182201 / NMLS ID 411068</p>
          <p className="text-xs text-gray-500 m-0">Copyright &copy; 2026 SpringWell Bank. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
