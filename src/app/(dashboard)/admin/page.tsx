"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, Search, LogOut, Users, ArrowUpDown, CheckCircle, XCircle, MessageSquare, Wallet, Send, Pencil, Trash2, ShieldCheck, UserCog, KeyRound, CalendarClock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sym } from "@/lib/format";
import { ProfileImageUpload } from "@/components/profile-image-upload";

type Modal = null | "credit" | "transfer" | "edit" | "status" | "complete" | "backdate";

export default function AdminDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const users = useQuery(api.users.list);
  const transactions = useQuery(api.transactions.recent, { limit: 20 });
  const messages = useQuery(api.admin.listMessages);
  const pending = useQuery(api.admin.pendingTransactions);

  const creditDebit = useMutation(api.admin.creditDebit);
  const transfer = useMutation(api.admin.transfer);
  const completeTransaction = useMutation(api.admin.completeTransaction);
  const backDateTransaction = useMutation(api.admin.backDateTransaction);
  const setUserStatus = useMutation(api.admin.setUserStatus);
  const setUserRole = useMutation(api.admin.setUserRole);
  const updateUser = useMutation(api.admin.updateUser);
  const deleteUser = useMutation(api.admin.deleteUser);
  const setMessageStatus = useMutation(api.admin.setMessageStatus);
  const adminGenerateUploadUrl = useMutation(api.admin.generateUploadUrl);
  const setUserImage = useMutation(api.admin.setUserImage);
  const removeUserImage = useMutation(api.admin.removeUserImage);

  const [creditType, setCreditType] = useState<"credit" | "debit">("credit");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");
  const [creditDate, setCreditDate] = useState("");

  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");
  const [transferDate, setTransferDate] = useState("");

  const [edit, setEdit] = useState({ firstName: "", lastName: "", email: "", accountType: "savings", currency: "USD", status: "active", balance: "", creditBalance: "" });
  const [statusTarget, setStatusTarget] = useState("");
  const [completeTxn, setCompleteTxn] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [backdateTxn, setBackdateTxn] = useState<any>(null);
  const [backdateValue, setBackdateValue] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  function togglePw(id: string) {
    setRevealed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  if (!userId || users === undefined || transactions === undefined || messages === undefined || pending === undefined) {
    return <div style={{ backgroundColor: "#eee", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#666" }}>Loading...</p></div>;
  }

  const adminUser = users.find((u: any) => u._id === userId);
  const customers = users.filter((u: any) =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const nonAdmins = users.filter((u: any) => u.role !== "admin");
  const totalBalance = nonAdmins.reduce((s: number, u: any) => s + (u.balance ?? 0), 0);
  const unreadMsgs = messages.filter((m: any) => m.status === "unread").length;

  function flash(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(""), 3000);
  }
  function acct(u: any) { return "SWB-" + u._id.slice(-8).toUpperCase(); }
  function initials(u: any) { return ((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase() || "?"; }

  function openCredit(u: any) { setActiveUser(u); setCreditAmount(""); setCreditDesc(""); setCreditType("credit"); setCreditDate(new Date().toISOString().slice(0, 10)); setModal("credit"); }
  function openTransfer(u: any) { setActiveUser(u); setFromUser(u?._id ?? ""); setToUser(""); setTransferAmount(""); setTransferDesc(""); setTransferDate(new Date().toISOString().slice(0, 10)); setModal("transfer"); }
  function openEdit(u: any) {
    setActiveUser(u);
    setEdit({ firstName: u.firstName, lastName: u.lastName, email: u.email, accountType: u.accountType, currency: u.currency, status: u.status, balance: String(u.balance ?? 0), creditBalance: String(u.creditBalance ?? 0) });
    setModal("edit");
  }
  function openStatus() { setStatusTarget(""); setModal("status"); }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !activeUser || !creditAmount) return;
    try {
      await creditDebit({ adminUserId: userId as any, userId: activeUser._id, type: creditType, amount: Number(creditAmount), description: creditDesc || (creditType === "credit" ? "Admin credit" : "Admin debit"), date: creditDate || undefined });
      flash(`${creditType === "credit" ? "Credit" : "Debit"} created — pending activation`);
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Transaction failed"); }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !fromUser || !toUser || !transferAmount) return;
    try {
      await transfer({ adminUserId: userId as any, fromUserId: fromUser as any, toUserId: toUser as any, amount: Number(transferAmount), description: transferDesc || "Admin transfer", date: transferDate || undefined });
      flash("Transfer created — pending activation");
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Transfer failed"); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !activeUser) return;
    try {
      await updateUser({
        adminUserId: userId as any, userId: activeUser._id,
        firstName: edit.firstName, lastName: edit.lastName, email: edit.email,
        accountType: edit.accountType as any, currency: edit.currency as any,
        status: edit.status as any, balance: Number(edit.balance), creditBalance: Number(edit.creditBalance) || 0,
      });
      flash("Account updated");
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Update failed"); }
  }

  async function handleStatus(uid: string, status: "active" | "suspended" | "pending") {
    if (!userId) return;
    await setUserStatus({ adminUserId: userId as any, userId: uid as any, status });
    flash(`Account ${status === "suspended" ? "suspended" : "activated"}`);
  }
  async function handleRole(uid: string, role: "admin" | "customer") {
    if (!userId) return;
    await setUserRole({ adminUserId: userId as any, userId: uid as any, role });
    flash(`Role set to ${role}`);
  }
  async function handleDelete(u: any) {
    if (!userId) return;
    if (!confirm(`Delete account ${acct(u)} (${u.email})?`)) return;
    try { await deleteUser({ adminUserId: userId as any, userId: u._id }); flash("Account deleted"); }
    catch (err: any) { flash(err?.message ?? "Delete failed"); }
  }
  async function handleMessage(id: string, status: "read" | "replied") {
    if (!userId) return;
    await setMessageStatus({ adminUserId: userId as any, messageId: id as any, status });
    flash(`Message marked ${status}`);
  }

  function openComplete(id?: string) {
    setCompleteTxn(id ?? "");
    setActivationCode("");
    setModal("complete");
  }
  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !completeTxn || !activationCode) return;
    try {
      await completeTransaction({ adminUserId: userId as any, transactionId: completeTxn as any, activationCode });
      flash("Transaction completed");
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Completion failed"); }
  }

  function openBackdate(t: any) {
    setBackdateTxn(t);
    setBackdateValue(new Date(t.createdAt).toISOString().slice(0, 10));
    setModal("backdate");
  }
  async function handleBackdate(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !backdateTxn || !backdateValue) return;
    try {
      await backDateTransaction({ adminUserId: userId as any, transactionId: backdateTxn._id as any, date: backdateValue });
      flash("Transaction date updated");
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Update failed"); }
  }

  const sectionStyle: React.CSSProperties = { backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, marginBottom: 20 };
  const sectionHeaderStyle: React.CSSProperties = { borderBottom: "2px solid #426FB6", padding: "12px 20px" };
  const sectionBodyStyle: React.CSSProperties = { padding: "16px 20px" };
  const tableHeaderStyle: React.CSSProperties = { backgroundColor: "#426FB6", color: "#fff", fontSize: 12, fontWeight: 600 };

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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Landmark style={{ color: "#426FB6", width: 32, height: 32 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: "#426FB6", fontFamily: "'BentonSans', Arial, sans-serif" }}>SpringWell Bank</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, width: 200, fontFamily: "inherit" }}
            />
            <div style={{ backgroundColor: "#FEDF01", padding: "10px 20px", borderRadius: 4, fontWeight: 700, fontSize: 14, color: "#000" }}>
              Signed In As Admin
            </div>
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
            imageId={adminUser?.imageId}
            firstName={adminUser?.firstName ?? "Admin"}
            lastName={adminUser?.lastName ?? ""}
            onImageSaved={() => {}}
            generateUploadUrl={() => adminGenerateUploadUrl({ adminUserId: userId as any })}
            saveImage={(args: any) => setUserImage({ adminUserId: userId as any, userId: args.userId, imageId: args.imageId })}
            removeImage={(args: any) => removeUserImage({ adminUserId: userId as any, userId: args.userId })}
            size="lg"
          />
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: "#000" }}>Hello, {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : "Admin"}</h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 4px" }}>Administrator Dashboard</p>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Total customer balance: <strong>{adminUser ? sym(adminUser.currency) : "$"}{totalBalance.toLocaleString()}</strong></p>
          </div>
        </div>

        {/* Search Bar (mobile) */}
        <div style={{ display: "flex", marginBottom: 20, border: "1px solid #ccc", borderRadius: 4, overflow: "hidden" }}>
          <input
            type="text"
            placeholder="How can we help you ?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "10px 16px", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }}
          />
          <button style={{ padding: "10px 16px", backgroundColor: "#eee", border: "none", borderLeft: "1px solid #ccc", cursor: "pointer" }}>
            <Search style={{ width: 18, height: 18, color: "#666" }} />
          </button>
        </div>

        {/* Action Message */}
        {actionMsg && (
          <div style={{ backgroundColor: "rgba(66,111,182,0.15)", border: "1px solid rgba(66,111,182,0.3)", borderRadius: 4, padding: "12px 20px", marginBottom: 20, fontSize: 14, color: "#426FB6" }}>
            {actionMsg}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Customers", value: String(nonAdmins.length), icon: Users },
            { label: "Total Balance", value: `${adminUser ? sym(adminUser.currency) : "$"}${totalBalance.toLocaleString()}`, icon: Wallet },
            { label: "Unread Msgs", value: String(unreadMsgs), icon: MessageSquare },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: "16px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <stat.icon style={{ width: 24, height: 24, color: "#426FB6" }} />
                <div>
                  <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{stat.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#000" }}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Credit/Debit", icon: ArrowUpDown, action: () => openCredit(null), color: "#426FB6" },
            { label: "Fund Transfer", icon: Send, action: () => openTransfer(null), color: "#426FB6" },
            { label: "Activate", icon: CheckCircle, action: openStatus, color: "#426FB6" },
            { label: "Suspend", icon: XCircle, action: openStatus, color: "#d93939" },
            { label: "Complete", icon: KeyRound, action: () => openComplete(), color: "#FEDF01" },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "16px 8px",
                border: "1px solid #eee",
                borderRadius: 4,
                backgroundColor: "#fff",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              <btn.icon style={{ width: 28, height: 28, color: btn.color }} />
              <span style={{ fontSize: 11, color: "#333", fontWeight: 500 }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Pending Transactions */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Pending Transactions ({pending.length})</h3>
          </div>
          <div style={sectionBodyStyle}>
            {pending.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>No pending transactions.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Type</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Account</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Amount</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((t: any) => (
                      <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px 12px" }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{t.type}</td>
                        <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>{acct(t)}</td>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{sym(t.currency)}{t.amount.toLocaleString()}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <button onClick={() => openComplete(t._id)} style={{ padding: "4px 12px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, cursor: "pointer" }}>Complete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* All Accounts */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>All Accounts ({customers.length})</h3>
          </div>
          <div style={sectionBodyStyle}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Account</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Full Name</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Type</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Balance</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Password</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 12 }}>{acct(c)}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#426FB6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initials(c)}</div>
                          {c.firstName} {c.lastName}
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{c.accountType}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{sym(c.currency)}{c.balance.toLocaleString()}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, backgroundColor: c.status === "active" ? "#d4edda" : c.status === "suspended" ? "#f8d7da" : "#fff3cd", color: c.status === "active" ? "#155724" : c.status === "suspended" ? "#721c24" : "#856404" }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{revealed.has(c._id) ? c.password : "••••••••"}</span>
                        <button type="button" onClick={() => togglePw(c._id)} style={{ background: "none", border: "none", color: "#426FB6", cursor: "pointer", fontSize: 11, marginLeft: 6 }}>
                          {revealed.has(c._id) ? "Hide" : "Show"}
                        </button>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <button title="Credit/Debit" onClick={() => openCredit(c)} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><ArrowUpDown style={{ width: 12, height: 12 }} /></button>
                          <button title="Transfer" onClick={() => openTransfer(c)} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><Send style={{ width: 12, height: 12 }} /></button>
                          {c.status !== "active" && <button title="Activate" onClick={() => handleStatus(c._id, "active")} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><CheckCircle style={{ width: 12, height: 12, color: "#28a745" }} /></button>}
                          {c.status !== "suspended" && <button title="Suspend" onClick={() => handleStatus(c._id, "suspended")} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><XCircle style={{ width: 12, height: 12, color: "#d93939" }} /></button>}
                          <button title="Edit" onClick={() => openEdit(c)} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><Pencil style={{ width: 12, height: 12 }} /></button>
                          <button title="Delete" onClick={() => handleDelete(c)} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><Trash2 style={{ width: 12, height: 12, color: "#d93939" }} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Messages ({messages.length})</h3>
          </div>
          <div style={sectionBodyStyle}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={tableHeaderStyle}>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>From</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Subject</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px 12px", textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m: any) => (
                    <tr key={m._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 12px" }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 600 }}>{m.name}<div style={{ color: "#666", fontSize: 11 }}>{m.email}</div></td>
                      <td style={{ padding: "8px 12px" }}>{m.subject ?? "N/A"}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, backgroundColor: m.status === "unread" ? "#f8d7da" : m.status === "replied" ? "#d4edda" : "#fff3cd", color: m.status === "unread" ? "#721c24" : m.status === "replied" ? "#155724" : "#856404" }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {m.status === "unread" && <button onClick={() => handleMessage(m._id, "read")} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}>Mark read</button>}
                          {m.status !== "replied" && <button onClick={() => handleMessage(m._id, "replied")} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11, color: "#426FB6" }}>Reply</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#000" }}>Recent Transactions</h3>
          </div>
          <div style={sectionBodyStyle}>
            {transactions.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>No transactions yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={tableHeaderStyle}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Date</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Type</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Description</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Amount</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Status</th>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t: any) => (
                      <tr key={t._id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px 12px" }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "8px 12px", textTransform: "capitalize" }}>{t.type}</td>
                        <td style={{ padding: "8px 12px" }}>{t.description || "N/A"}</td>
                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{sym(t.currency)}{t.amount.toLocaleString()}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, backgroundColor: t.status === "successful" ? "#d4edda" : "#f8d7da", color: t.status === "successful" ? "#155724" : "#721c24" }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <button onClick={() => openBackdate(t)} style={{ padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 }}><CalendarClock style={{ width: 12, height: 12, marginRight: 4 }} />Back Date</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: "16px 0" }}>
          For checking, savings, and money market accounts, the balance may reflect transaction that have not yet posted to your account. For credit card Gold option and Gold reserve accounts, the balance may not reflect recent transactions or pending payments.
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

      {/* Footer */}
      <div style={{ backgroundColor: "#eee", borderTop: "1px solid #ddd" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>Phone +44 7445 182201 / NMLS ID 411068</p>
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>Copyright &copy; 2026 SpringWell Bank. All Rights Reserved.</p>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: 20 }} onClick={() => setModal(null)}>
          <div style={{ width: "100%", maxWidth: 480, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", color: "#fff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {modal === "credit" && "Credit / Debit Account"}
                {modal === "transfer" && "Fund Transfer"}
                {modal === "edit" && "Edit Account"}
                {modal === "status" && "Change Account Status"}
                {modal === "complete" && "Complete Transaction"}
                {modal === "backdate" && "Back Date Transaction"}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 0, lineHeight: 1 }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              {modal === "credit" && (
                <form onSubmit={handleCredit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{activeUser ? `${activeUser.firstName} ${activeUser.lastName} (${activeUser.email})` : "Select a customer"}</p>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={activeUser?._id ?? ""} onChange={(e) => { const u = users.find((x: any) => x._id === e.target.value); setActiveUser(u); }}>
                    <option value="">Select user</option>
                    {nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                  </select>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={creditType} onChange={(e) => setCreditType(e.target.value as "credit" | "debit")}>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                  <input type="number" placeholder="Amount" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} required />
                  <input placeholder="Description" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} />
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Transaction date</label>
                    <input type="date" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, width: "100%" }} value={creditDate} onChange={(e) => setCreditDate(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Submit</button>
                  </div>
                </form>
              )}
              {modal === "transfer" && (
                <form onSubmit={handleTransfer} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={fromUser} onChange={(e) => setFromUser(e.target.value)} required>
                    <option value="">From account</option>
                    {users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName} {u.lastName}</option>)}
                  </select>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={toUser} onChange={(e) => setToUser(e.target.value)} required>
                    <option value="">To account</option>
                    {users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName} {u.lastName}</option>)}
                  </select>
                  <input type="number" placeholder="Amount" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} required />
                  <input placeholder="Description" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} />
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Transaction date</label>
                    <input type="date" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, width: "100%" }} value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Transfer</button>
                  </div>
                </form>
              )}
              {modal === "edit" && (
                <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input placeholder="First name" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.firstName} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} />
                    <input placeholder="Last name" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.lastName} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} />
                  </div>
                  <input placeholder="Email" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.accountType} onChange={(e) => setEdit({ ...edit, accountType: e.target.value })}>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="business">Business</option>
                    </select>
                    <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.currency} onChange={(e) => setEdit({ ...edit, currency: e.target.value })}>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="pending">pending</option>
                    </select>
                    <input type="number" placeholder="Balance" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.balance} onChange={(e) => setEdit({ ...edit, balance: e.target.value })} />
                  </div>
                  <input type="number" placeholder="Credit Balance" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={edit.creditBalance} onChange={(e) => setEdit({ ...edit, creditBalance: e.target.value })} />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
                  </div>
                </form>
              )}
              {modal === "status" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Select an account to activate or suspend.</p>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={statusTarget} onChange={(e) => setStatusTarget(e.target.value)} required>
                    <option value="">Select account</option>
                    {nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                  </select>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "active"); setModal(null); } }} style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: statusTarget ? 1 : 0.5 }}>Activate</button>
                    <button disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "suspended"); setModal(null); } }} style={{ padding: "8px 16px", backgroundColor: "#d93939", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: statusTarget ? 1 : 0.5 }}>Suspend</button>
                  </div>
                </div>
              )}
              {modal === "complete" && (
                <form onSubmit={handleComplete} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>Select a pending transaction and enter the activation code.</p>
                  <select style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={completeTxn} onChange={(e) => setCompleteTxn(e.target.value)} required>
                    <option value="">Select transaction</option>
                    {pending.map((t: any) => (
                      <option key={t._id} value={t._id}>{acct(t)} · {t.type} · {sym(t.currency)}{t.amount.toLocaleString()}</option>
                    ))}
                  </select>
                  <input type="text" placeholder="Activation Code" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14 }} value={activationCode} onChange={(e) => setActivationCode(e.target.value)} required />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Complete</button>
                  </div>
                </form>
              )}
              {modal === "backdate" && (
                <form onSubmit={handleBackdate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {backdateTxn && <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{backdateTxn.description || "N/A"}</p>}
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Transaction date</label>
                    <input type="date" style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, width: "100%" }} value={backdateValue} onChange={(e) => setBackdateValue(e.target.value)} required />
                  </div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 8 }}>
                    <button type="button" onClick={() => setModal(null)} style={{ padding: "8px 16px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13 }}>Cancel</button>
                    <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#426FB6", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Update</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
