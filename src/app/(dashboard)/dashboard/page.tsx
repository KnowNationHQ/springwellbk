"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, LogOut, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, User, FileText, Settings, Menu, Link2, Building2, Search, Bell, DollarSign, Repeat, Tag, MessageSquare, PiggyBank, Target, UserPlus, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sym } from "@/lib/format";
import { ProfileImageUpload } from "@/components/profile-image-upload";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ toEmail: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferBusy, setTransferBusy] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);
  const transfer = useMutation(api.auth.transfer);
  const linkBank = useMutation(api.plaid.linkBank);
  const syncUser = useAction(api.plaidSync.syncUser);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const saveProfileImage = useMutation(api.auth.saveProfileImage);
  const removeProfileImage = useMutation(api.auth.removeProfileImage);
  const links = useQuery(api.plaid.getLinks, userId ? { userId: userId as any } : "skip");

  async function connectBank() {
    if (!userId) return;
    setBusy(true);
    try {
      await linkBank({ userId: userId as any });
      await syncUser({ userId: userId as any });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const stats = useQuery(
    api.auth.getDashboardStats,
    userId ? { userId: userId as any } : "skip"
  );

  if (!userId || !stats) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#eee" }}><p className="text-gray-500">Loading...</p></div>;
  }

  const { user, transactions } = stats;

  const cardLast4 = (userId?.replace(/[^0-9]/g, "").slice(-4)) || "4242";
  const cardNumber = `**** **** **** ${cardLast4}`;

  async function handleProfileSave() {
    setProfileMsg("");
    try {
      await updateProfile({ userId: userId as any, ...profileFields });
      setProfileMsg("Profile updated successfully.");
      setEditing(false);
    } catch (err: any) {
      setProfileMsg(err.message || "Failed to update profile.");
    }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");
    setTransferBusy(true);
    try {
      const amt = parseFloat(transferForm.amount);
      if (!transferForm.toEmail || isNaN(amt) || amt <= 0) throw new Error("Enter a valid recipient email and amount");
      await transfer({ fromUserId: userId as any, toEmail: transferForm.toEmail, amount: amt, description: transferForm.description || undefined });
      setTransferForm({ toEmail: "", amount: "", description: "" });
      setTransferSuccess("Transfer sent successfully!");
      setTimeout(() => { setTransferOpen(false); setTransferSuccess(""); }, 2000);
    } catch (err: any) {
      setTransferError(err.message || "Transfer failed");
    } finally {
      setTransferBusy(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.next !== pwForm.confirm) { setPwMsg("New passwords do not match"); return; }
    try {
      await changePassword({ userId: userId as any, currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg("Password updated successfully.");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      setPwMsg(err.message || "Could not update password");
    }
  }

  const activityItems = [
    { label: "Alerts", icon: Bell },
    { label: "Bill Pay", icon: DollarSign },
    { label: "Transactions", icon: Clock },
    { label: "Transfer Funds", icon: ArrowUpRight, action: () => setTransferOpen(true) },
    { label: "Special Offers", icon: Tag },
    { label: "Messages", icon: FileText },
    { label: "Spending & Budgeting", icon: PiggyBank },
    { label: "Goals", icon: Target },
    { label: "Open account", icon: UserPlus },
  ];

  return (
    <div style={{ backgroundColor: "#eee", minHeight: "100vh", fontFamily: "'Hind', Arial, sans-serif" }}>
      {/* Top Nav */}
      <nav style={{ backgroundColor: "#434343", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
          <ul style={{ display: "flex", gap: 0, listStyle: "none", margin: 0, padding: 0, flexWrap: "wrap" }}>
            <li style={{ padding: "12px 20px", borderBottom: "3px solid #FEDF01", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Online banking</li>
            <li style={{ padding: "12px 20px", fontSize: 14, cursor: "pointer" }}>About SpringWell Bank</li>
            <li style={{ padding: "12px 20px", fontSize: 14, cursor: "pointer", marginLeft: "auto" }}>
              <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, padding: 0 }}>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Header with Logo */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Landmark style={{ color: "#426FB6", width: 32, height: 32 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: "#426FB6", fontFamily: "'BentonSans', Arial, sans-serif" }}>SpringWell Bank</span>
          </div>
          <div style={{ backgroundColor: "#FEDF01", padding: "10px 20px", borderRadius: 4, fontWeight: 700, fontSize: 14, color: "#000" }}>
            Signed In As {user.firstName} {user.lastName}
          </div>
        </div>
      </div>

      {/* Blue Sub Header */}
      <div style={{ backgroundColor: "#426FB6", height: 50 }} />

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>

        {/* Profile Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "30px 0 20px", flexWrap: "wrap" }}>
          <ProfileImageUpload
            userId={userId}
            imageId={user.imageId}
            firstName={user.firstName}
            lastName={user.lastName}
            onImageSaved={() => {}}
            generateUploadUrl={generateUploadUrl}
            saveImage={saveProfileImage}
            removeImage={removeProfileImage}
            size="lg"
          />
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "#000" }}>Hello, {user.firstName} {user.lastName}</h2>
            <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0, fontWeight: 500 }}>Update profile</button>
              <span style={{ color: "#ccc" }}>|</span>
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0, fontWeight: 500 }}>Security center</button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: "flex", marginBottom: 20, border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
          <input
            type="text"
            placeholder="How can we help you ?"
            style={{ flex: 1, padding: "10px 16px", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }}
          />
          <button style={{ padding: "10px 16px", backgroundColor: "#eee", border: "none", borderLeft: "1px solid #ccc", cursor: "pointer" }}>
            <Search style={{ width: 18, height: 18, color: "#666" }} />
          </button>
        </div>

        {/* Account Disabled Alert */}
        <div style={{ backgroundColor: "rgba(217, 57, 57, 0.15)", border: "1px solid rgba(217, 57, 57, 0.3)", borderRadius: 4, padding: "12px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <AlertTriangle style={{ width: 20, height: 20, color: "#d93939" }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Account Disabled</h3>
          </div>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "#333" }}>Hello, Your account has been disabled due to suspicious activities from unknown location.</p>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: "#333" }}>Please visit any of our branches on how to resolve this issue.</p>
          <button style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0 }}>Quick view</button>
        </div>

        {/* Personal Accounts */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ borderBottom: "2px solid #426FB6", padding: "12px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Personal accounts</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ fontSize: 14, color: "#333", margin: "0 0 4px" }}>SpringWell Bank Core checking - 9080</p>
                <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Account Number - {cardNumber}</p>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#000", margin: 0 }}>{sym(user.currency)}{user.balance.toLocaleString()}</p>
            </div>
            <button style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0, marginTop: 12 }}>Quick view</button>
          </div>
        </div>

        {/* Most Recent Transactions */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ borderBottom: "2px solid #426FB6", padding: "12px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Most Recent Transactions ({transactions.length})</h3>
          </div>
          <div style={{ padding: "12px 20px" }}>
            {transactions.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>No transactions yet.</p>
            ) : (
              transactions.slice(0, 5).map((t: any) => (
                <div key={t._id} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, color: "#333", margin: 0 }}>{new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })} {new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: t.type === "credit" ? "#000" : "#000", margin: 0 }}>
                      {t.type === "credit" ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
                    </p>
                  </div>
                  <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>
                    {t.type === "credit" ? "CREDIT" : "FUND TRANSFER"} @ {t.description || "N/A"}
                  </p>
                  <button style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 12, padding: 0, marginTop: 4 }}>Tap for more details</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Investment Accounts */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ borderBottom: "2px solid #426FB6", padding: "12px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Investment accounts</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 14, color: "#333", margin: "0 0 8px" }}>SpringWell Bank Core checking - 9080</p>
            <button style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0 }}>Quick view</button>
          </div>
        </div>

        {/* Bank Cards */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20 }}>
          <div style={{ borderBottom: "2px solid #426FB6", padding: "12px 20px" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Bank Cards</h3>
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: 14, color: "#333", margin: "0 0 16px" }}>SpringWell Bank Card - 9040</p>
            {/* VISA Card */}
            <div style={{
              width: "100%",
              maxWidth: 380,
              height: 240,
              borderRadius: 16,
              background: "linear-gradient(135deg, #1a3a5c 0%, #2a5a8c 50%, #1a3a5c 100%)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
              color: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
            }}>
              {/* World map overlay */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.15, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='%23ffffff' d='M150,100 Q200,80 250,100 T350,100 Q400,80 450,100 T550,100 Q600,80 650,100 T750,100 Q800,80 850,100 T950,100 V400 Q900,420 850,400 T750,400 Q700,420 650,400 T550,400 Q500,420 450,400 T350,400 Q300,420 250,400 T150,400 Z'/%3E%3C/svg%3E\")", backgroundSize: "cover" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                <div style={{ width: 40, height: 30, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 20, height: 14, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, fontStyle: "italic", color: "#FEDF01" }}>VISA</span>
              </div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 22, letterSpacing: 4, fontWeight: 600, margin: "0 0 16px", fontFamily: "monospace" }}>{cardNumber}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: 1, margin: "0 0 2px", opacity: 0.8 }}>CARD HOLDER</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: 1 }}>{user.firstName} {user.lastName}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, letterSpacing: 1, margin: "0 0 2px", opacity: 0.8 }}>EXPIRES</p>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>10/2028</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Center */}
        <div style={{ backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20, padding: "16px 20px 20px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#333" }}>Activity Center</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "20px 8px",
                    border: "1px solid #eee",
                    borderRadius: 4,
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  <Icon style={{ width: 32, height: 32, color: "#426FB6" }} />
                  <span style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "16px 0" }}>
          For checking, savings, and money market accounts, the balance may reflect transaction that have not yet posted to your account. For credit card Gold option and Gold reserve accounts, the balance may not reflect recent transactions or pending payments.
        </p>

        {/* Last Sign In */}
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>
          Last sign in {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}
        </p>

        {/* Secure Area Bar */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>Secure Area</span>
          <div style={{ display: "flex", gap: 20 }}>
            <button style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0 }}>En Espanol</button>
            <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 14, padding: 0 }}>Sign out</button>
          </div>
        </div>

      </div>

      {/* Footer Sections */}
      <div style={{ backgroundColor: "#eee", borderTop: "1px solid #ddd" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>

          {/* Subscribe */}
          <h3 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", margin: "0 0 20px", color: "#333" }}>Subscribe to Our Email List</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30 }}>
            <input type="text" placeholder="FULLNAME" style={{ padding: "12px 16px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "inherit" }} />
            <input type="email" placeholder="EMAIL" style={{ padding: "12px 16px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "inherit" }} />
            <button style={{ padding: "14px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>SIGN UP</button>
          </div>

          {/* Download App */}
          <p style={{ fontSize: 16, textAlign: "center", margin: "0 0 12px", color: "#333" }}>
            <span style={{ color: "#426FB6", fontWeight: 700 }}>Download</span> our free mobile App today!
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 30 }}>
            <div style={{ backgroundColor: "#000", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>Apple</span>
              <div>
                <div style={{ fontSize: 8, opacity: 0.8 }}>Download on the</div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>App Store</div>
              </div>
            </div>
            <div style={{ backgroundColor: "#000", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18, color: "#4285F4" }}>Play</span>
              <div>
                <div style={{ fontSize: 8, opacity: 0.8 }}>GET IT ON</div>
                <div style={{ fontWeight: 700, fontSize: 12 }}>Google Play</div>
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            {["#3b5998", "#1DA1F2", "#0077B5", "#E1306C", "#FF0000"].map((color, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{["f", "t", "in", "ig", "▶"][i]}</span>
              </div>
            ))}
          </div>

          {/* Footer Links */}
          <div style={{ textAlign: "center", fontSize: 13, color: "#426FB6", marginBottom: 8 }}>
            <a href="#" style={{ color: "#426FB6", textDecoration: "none" }}>Contact Us</a>
            <span style={{ margin: "0 6px", color: "#999" }}>/</span>
            <a href="#" style={{ color: "#426FB6", textDecoration: "none" }}>Find a branch or ATM</a>
            <span style={{ margin: "0 6px", color: "#999" }}>/</span>
            <a href="#" style={{ color: "#426FB6", textDecoration: "none" }}>Careers</a>
            <span style={{ margin: "0 6px", color: "#999" }}>/</span>
            <a href="#" style={{ color: "#426FB6", textDecoration: "none" }}>Disclosure & Privacy Policy</a>
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "#666", margin: "0 0 4px" }}>Phone +44 7445 182201 / NMLS ID 411068</p>
          <p style={{ textAlign: "center", fontSize: 12, color: "#666", margin: 0 }}>Copyright &copy; 2026 SpringWell Bank. All Rights Reserved.</p>
        </div>
      </div>

      {/* Transfer Modal */}
      {transferOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 }} onClick={() => setTransferOpen(false)}>
          <div style={{ width: "100%", maxWidth: 420, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Transfer Funds</h3>
              <button onClick={() => setTransferOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <form onSubmit={handleTransfer} style={{ padding: 20 }}>
              {transferError && <p style={{ color: "#d93939", fontSize: 13, backgroundColor: "rgba(217,57,57,0.1)", padding: 8, borderRadius: 4, margin: "0 0 12px" }}>{transferError}</p>}
              {transferSuccess && <p style={{ color: "#426FB6", fontSize: 13, backgroundColor: "rgba(66,111,182,0.1)", padding: 8, borderRadius: 4, margin: "0 0 12px" }}>{transferSuccess}</p>}
              <div style={{ marginBottom: 12 }}>
                <Label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Recipient email</Label>
                <Input type="email" required placeholder="friend@springwellbk.com" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={transferForm.toEmail} onChange={(e) => setTransferForm({ ...transferForm, toEmail: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Amount ({user.currency})</Label>
                <Input type="number" required min="0.01" step="0.01" placeholder="0.00" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Note (optional)</Label>
                <Input placeholder="Dinner, rent, etc." style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} />
              </div>
              <p style={{ fontSize: 12, color: "#666", margin: "0 0 12px" }}>Available: {sym(user.currency)}{user.balance.toLocaleString()}</p>
              <Button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }} disabled={transferBusy}>
                {transferBusy ? "Sending..." : "Send Transfer"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 }} onClick={() => setEditing(false)}>
          <div style={{ width: "100%", maxWidth: 500, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Profile</h3>
              <button onClick={() => setEditing(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              {profileMsg && <p style={{ color: profileMsg.includes("success") ? "#426FB6" : "#d93939", fontSize: 13, marginBottom: 12 }}>{profileMsg}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Last Name", key: "lastName" },
                  { label: "Phone", key: "phone" },
                  { label: "Address", key: "address" },
                ].map((field) => (
                  <div key={field.key}>
                    <Label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{field.label}</Label>
                    <Input
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }}
                      value={profileFields[field.key] || ""}
                      onChange={(e) => setProfileFields({ ...profileFields, [field.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginBottom: 16 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Security</h4>
                {pwMsg && <p style={{ color: pwMsg.includes("success") ? "#426FB6" : "#d93939", fontSize: 13, marginBottom: 12 }}>{pwMsg}</p>}
                <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: 10 }}>
                  <Input type="password" placeholder="Current Password" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
                  <Input type="password" placeholder="New Password" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
                  <Input type="password" placeholder="Confirm New Password" style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                  <Button type="submit" style={{ padding: "10px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Update Password</Button>
                </form>
              </div>
              <Button onClick={handleProfileSave} style={{ width: "100%", padding: "12px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
