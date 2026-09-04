"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, ArrowRightLeft, Globe, ArrowRight, CheckCircle, Loader2, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

type TransferType = null | "domestic" | "international";

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

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const currentUser = users?.find((u: any) => u._id === userId);

  if (!userId || users === undefined) {
    return <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Loader2 className="animate-spin h-8 w-8 text-[#426FB6]" /></div>;
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

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", fontFamily: "'Hind', Arial, sans-serif" }}>
      {/* Nav */}
      <nav style={{ backgroundColor: "#434343", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Landmark style={{ color: "#FEDF01", width: 20, height: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>SpringWell Bank</span>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <Link href="/dashboard" style={{ color: "#ccc", textDecoration: "none" }}>Dashboard</Link>
            <Link href="/transfer" style={{ color: "#FEDF01", textDecoration: "none", fontWeight: 600 }}>Transfer</Link>
            <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 13 }}>Sign out</button>
          </div>
        </div>
      </nav>

      {/* Blue bar */}
      <div style={{ backgroundColor: "#426FB6", height: 6 }} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 20px" }}>
        {/* Back link */}
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#426FB6", fontSize: 14, marginBottom: 20, textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#000", marginBottom: 4 }}>Transfer Money</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 30 }}>Send money domestically or internationally in seconds.</p>

        {/* Balance card */}
        <div style={{ backgroundColor: "#426FB6", borderRadius: 12, padding: "20px 24px", marginBottom: 30, color: "#fff" }}>
          <p style={{ fontSize: 12, opacity: 0.8, margin: "0 0 4px" }}>Available Balance</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
            {currentUser?.currency === "EUR" ? "€" : currentUser?.currency === "GBP" ? "£" : "$"}
            {(currentUser?.balance ?? 0).toLocaleString()}
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#16a34a", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        {/* Transfer Type Selection */}
        {!transferType && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <button
              onClick={() => setTransferType("domestic")}
              style={{
                backgroundColor: "#fff",
                border: "2px solid #e5e7eb",
                borderRadius: 16,
                padding: "40px 24px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#426FB6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <ArrowRightLeft size={28} style={{ color: "#426FB6" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 8px" }}>Domestic Transfer</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Send to another SpringWell user instantly</p>
            </button>

            <button
              onClick={() => setTransferType("international")}
              style={{
                backgroundColor: "#fff",
                border: "2px solid #e5e7eb",
                borderRadius: 16,
                padding: "40px 24px",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#426FB6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Globe size={28} style={{ color: "#ca8a04" }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#000", margin: "0 0 8px" }}>International Transfer</h3>
              <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Send to any bank worldwide</p>
            </button>
          </div>
        )}

        {/* Domestic Form */}
        {transferType === "domestic" && (
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: 16 }}>
            <CardContent style={{ padding: "30px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowRightLeft size={20} style={{ color: "#426FB6" }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#000" }}>Domestic Transfer</h2>
                    <p style={{ fontSize: 12, color: "#666", margin: 0 }}>To another SpringWell user</p>
                  </div>
                </div>
                <button onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#666" }}>← Back</button>
              </div>

              <form onSubmit={handleDomestic} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <Label htmlFor="dom-to" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Recipient Email *</Label>
                  <Input
                    id="dom-to"
                    type="email"
                    required
                    placeholder="friend@springwellbk.com"
                    value={domesticForm.toEmail}
                    onChange={(e) => setDomesticForm({ ...domesticForm, toEmail: e.target.value })}
                    style={{ height: 44 }}
                  />
                </div>
                <div>
                  <Label htmlFor="dom-amount" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Amount (USD) *</Label>
                  <Input
                    id="dom-amount"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={domesticForm.amount}
                    onChange={(e) => setDomesticForm({ ...domesticForm, amount: e.target.value })}
                    style={{ height: 44 }}
                  />
                </div>
                <div>
                  <Label htmlFor="dom-desc" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Description</Label>
                  <Input
                    id="dom-desc"
                    placeholder="What's this for?"
                    value={domesticForm.description}
                    onChange={(e) => setDomesticForm({ ...domesticForm, description: e.target.value })}
                    style={{ height: 44 }}
                  />
                </div>
                <Button type="submit" disabled={loading} style={{ backgroundColor: "#426FB6", color: "#fff", height: 48, fontSize: 15, fontWeight: 700, borderRadius: 10, marginTop: 8 }}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <ArrowRight size={18} className="mr-2" />}
                  {loading ? "Sending..." : "Send Transfer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* International Form */}
        {transferType === "international" && (
          <Card style={{ border: "1px solid #e5e7eb", borderRadius: 16 }}>
            <CardContent style={{ padding: "30px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Globe size={20} style={{ color: "#ca8a04" }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#000" }}>International Transfer</h2>
                    <p style={{ fontSize: 12, color: "#666", margin: 0 }}>To any bank account worldwide</p>
                  </div>
                </div>
                <button onClick={() => { setTransferType(null); setError(""); setSuccess(""); }} style={{ background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13, color: "#666" }}>← Back</button>
              </div>

              <form onSubmit={handleInternational} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-name" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Recipient Name *</Label>
                    <Input id="intl-name" required placeholder="Full name" value={intlForm.recipientName} onChange={(e) => setIntlForm({ ...intlForm, recipientName: e.target.value })} style={{ height: 44 }} />
                  </div>
                  <div>
                    <Label htmlFor="intl-bank" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Bank Name *</Label>
                    <Input id="intl-bank" required placeholder="Bank name" value={intlForm.recipientBank} onChange={(e) => setIntlForm({ ...intlForm, recipientBank: e.target.value })} style={{ height: 44 }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-routing" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Routing Number</Label>
                    <Input id="intl-routing" placeholder="ABA / Routing" value={intlForm.routingNumber} onChange={(e) => setIntlForm({ ...intlForm, routingNumber: e.target.value })} style={{ height: 44 }} />
                  </div>
                  <div>
                    <Label htmlFor="intl-account" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Account Number</Label>
                    <Input id="intl-account" placeholder="Account number" value={intlForm.accountNumber} onChange={(e) => setIntlForm({ ...intlForm, accountNumber: e.target.value })} style={{ height: 44 }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-iban" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>IBAN (for international)</Label>
                    <Input id="intl-iban" placeholder="GB29NWBK60161331926819" value={intlForm.iban} onChange={(e) => setIntlForm({ ...intlForm, iban: e.target.value })} style={{ height: 44 }} />
                  </div>
                  <div>
                    <Label htmlFor="intl-swift" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>SWIFT / BIC Code</Label>
                    <Input id="intl-swift" placeholder="NWBKGB2L" value={intlForm.swiftCode} onChange={(e) => setIntlForm({ ...intlForm, swiftCode: e.target.value })} style={{ height: 44 }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                  <div>
                    <Label htmlFor="intl-amount" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Amount *</Label>
                    <Input id="intl-amount" type="number" required min="0.01" step="0.01" placeholder="0.00" value={intlForm.amount} onChange={(e) => setIntlForm({ ...intlForm, amount: e.target.value })} style={{ height: 44 }} />
                  </div>
                  <div>
                    <Label htmlFor="intl-currency" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Currency</Label>
                    <select
                      id="intl-currency"
                      value={intlForm.currency}
                      onChange={(e) => setIntlForm({ ...intlForm, currency: e.target.value })}
                      style={{ height: 44, width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0 12px", fontSize: 14, fontFamily: "inherit", backgroundColor: "#fff" }}
                    >
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
                  <Label htmlFor="intl-desc" style={{ fontSize: 12, color: "#666", marginBottom: 4, display: "block" }}>Purpose / Note</Label>
                  <Input id="intl-desc" placeholder="Invoice payment, family support, etc." value={intlForm.description} onChange={(e) => setIntlForm({ ...intlForm, description: e.target.value })} style={{ height: 44 }} />
                </div>

                <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#475569" }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 600 }}>⏱ Processing Time</p>
                  <p style={{ margin: 0 }}>International transfers are processed within 1–3 business days. SWIFT/IBAN details are verified before execution.</p>
                </div>

                <Button type="submit" disabled={loading} className="hover:opacity-90" style={{ backgroundColor: "#ca8a04", color: "#fff", height: 48, fontSize: 15, fontWeight: 700, borderRadius: 10, marginTop: 8 }}>
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Globe size={18} className="mr-2" />}
                  {loading ? "Processing..." : "Send International Transfer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info section */}
        {!transferType && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { icon: "🔒", title: "Secure & Encrypted", desc: "256-bit encryption protects every transfer" },
                { icon: "⚡", title: "Instant Domestic", desc: "SpringWell-to-SpringWell transfers are instant" },
                { icon: "🌍", title: "200+ Countries", desc: "Send money to over 200 countries worldwide" },
              ].map((item) => (
                <div key={item.title} style={{ backgroundColor: "#fff", borderRadius: 12, padding: "20px 16px", border: "1px solid #e5e7eb", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "#000" }}>{item.title}</h4>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
