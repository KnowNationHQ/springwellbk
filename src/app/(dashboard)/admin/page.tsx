"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Users, ArrowUpDown, CheckCircle, XCircle, MessageSquare, Wallet, Send, Pencil, Trash2, KeyRound, CalendarClock, ArrowRight, Globe, Shield, Ban, Copy, History } from "lucide-react";
import { sym } from "@/lib/format";
import { UserAvatar } from "@/components/user-avatar";
import { BankNav } from "@/components/layout/bank-nav";
import { Modal } from "@/components/ui/modal";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Modal = null | "credit" | "transfer" | "edit" | "status" | "complete" | "backdate" | "profile" | "txns";

export default function AdminDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [activeUser, setActiveUser] = useState<any>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  useEffect(() => {
    if (!modal) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setModal(null); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modal]);

  const users = useQuery(api.users.list);
  const transactions = useQuery(api.transactions.recent, { limit: 20 });
  const messages = useQuery(api.admin.listMessages);
  const pending = useQuery(api.admin.pendingTransactions);
  const frozenTransfers = useQuery(api.admin.pendingFrozenTransfers);

  const creditDebit = useMutation(api.admin.creditDebit);
  const transferAdmin = useMutation(api.admin.transfer);
  const completeTransaction = useMutation(api.admin.completeTransaction);
  const backDateTransaction = useMutation(api.admin.backDateTransaction);
  const setUserStatus = useMutation(api.admin.setUserStatus);
  const updateUser = useMutation(api.admin.updateUser);
  const deleteUser = useMutation(api.admin.deleteUser);
  const setMessageStatus = useMutation(api.admin.setMessageStatus);
  const generateTransferCodes = useMutation(api.admin.generateTransferCodes);
  const clearPendingTransactions = useMutation(api.admin.clearPendingTransactions);
  const sendVerificationCodes = useAction(api.email.sendVerificationCodes);
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const saveProfileImage = useMutation(api.auth.saveProfileImage);
  const removeProfileImage = useMutation(api.auth.removeProfileImage);

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
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completePercent, setCompletePercent] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});
  const [profileFields, setProfileFields] = useState({ firstName: "", lastName: "", phone: "", address: "" });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [txnsUser, setTxnsUser] = useState<any>(null);
  const customerTxns = useQuery(api.transactions.getByUser, txnsUser ? { userId: txnsUser._id } : "skip");
  const [successPopup, setSuccessPopup] = useState<{ title: string; message: string; details?: { label: string; value: string }[] } | null>(null);
  function togglePw(id: string) { setRevealed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  function copyCode(code: string) { navigator.clipboard.writeText(code); setCopiedCode(code); setTimeout(() => setCopiedCode(null), 1500); }

  useEffect(() => {
    if (!completeLoading) { setCompletePercent(0); return; }
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct > 92) pct = 92;
      setCompletePercent(Math.floor(pct));
    }, 200);
    return () => clearInterval(iv);
  }, [completeLoading]);

  if (!userId || users === undefined || transactions === undefined || messages === undefined || pending === undefined || frozenTransfers === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  const adminUser = users.find((u: any) => u._id === userId);
  const customers = users.filter((u: any) => {
    if (u.role === "admin") return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u._id.slice(-8).toUpperCase().includes(q.toUpperCase());
  });
  const nonAdmins = users.filter((u: any) => u.role !== "admin");
  const totalBalance = nonAdmins.reduce((s: number, u: any) => s + (u.balance ?? 0), 0);
  const unreadMsgs = messages.filter((m: any) => m.status === "unread").length;

  function flash(title: string, message?: string) { setSuccessPopup({ title, message: message ?? "" }); }
  function acct(u: any) { return "SWB-" + u._id.slice(-8).toUpperCase(); }

  function openCredit(u: any) { setActiveUser(u); setCreditAmount(""); setCreditDesc(""); setCreditType("credit"); setCreditDate(new Date().toISOString().slice(0, 10)); setModal("credit"); }
  function openTransfer(u: any) { setActiveUser(u); setFromUser(u?._id ?? ""); setToUser(""); setTransferAmount(""); setTransferDesc(""); setTransferDate(new Date().toISOString().slice(0, 10)); setModal("transfer"); }
  function openEdit(u: any) { setActiveUser(u); setEdit({ firstName: u.firstName, lastName: u.lastName, email: u.email, accountType: u.accountType, currency: u.currency, status: u.status, balance: String(u.balance ?? 0), creditBalance: String(u.creditBalance ?? 0) }); setModal("edit"); }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !activeUser || !creditAmount) return;
    try { await creditDebit({ adminUserId: userId as any, userId: activeUser._id, type: creditType, amount: Number(creditAmount), description: creditDesc || (creditType === "credit" ? "Admin credit" : "Admin debit"), date: creditDate || undefined }); flash("Transaction Successful!", `${creditType === "credit" ? "Credit" : "Debit"} of $${Number(creditAmount).toLocaleString()} created`); setModal(null); } catch (err: any) { flash("Error", err?.message ?? "Failed"); }
  }
  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !fromUser || !toUser || !transferAmount) return;
    try { await transferAdmin({ adminUserId: userId as any, fromUserId: fromUser as any, toUserId: toUser as any, amount: Number(transferAmount), description: transferDesc || "Admin transfer", date: transferDate || undefined }); flash("Transfer Successful!", `$${Number(transferAmount).toLocaleString()} transferred`); setModal(null); } catch (err: any) { flash("Error", err?.message ?? "Failed"); }
  }
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !activeUser) return;
    try { await updateUser({ adminUserId: userId as any, userId: activeUser._id, firstName: edit.firstName, lastName: edit.lastName, email: edit.email, accountType: edit.accountType as any, currency: edit.currency as any, status: edit.status as any, balance: Number(edit.balance), creditBalance: Number(edit.creditBalance) || 0 }); flash("Account Updated", `${edit.firstName} ${edit.lastName} profile saved`); setModal(null); } catch (err: any) { flash("Error", err?.message ?? "Failed"); }
  }
  async function handleStatus(uid: string, status: "active" | "suspended" | "pending") { if (!userId) return; await setUserStatus({ adminUserId: userId as any, userId: uid as any, status }); flash(`Account ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Account has been ${status}`); }
  async function handleDelete(u: any) { if (!userId) return; if (!confirm(`Delete ${acct(u)}?`)) return; try { await deleteUser({ adminUserId: userId as any, userId: u._id }); flash("Deleted", `${acct(u)} removed`); } catch (err: any) { flash("Error", err?.message ?? "Failed"); } }
  async function handleMessage(id: string, status: "read" | "replied") { if (!userId) return; await setMessageStatus({ adminUserId: userId as any, messageId: id as any, status }); flash(`Marked ${status}`); }
  function openComplete(id?: string) { setCompleteTxn(id ?? ""); setActivationCode(""); setModal("complete"); }
  async function handleComplete(e: React.FormEvent) {
    e.preventDefault(); if (!userId || !completeTxn || !activationCode) return; setCompleteLoading(true);
    try {
      const frozenTx = frozenTransfers?.find((t: any) => t._id === completeTxn);
      if (frozenTx) {
        const sender = users?.find((u: any) => u._id === frozenTx.userId);
        await generateTransferCodes({ adminUserId: userId as any, transactionId: completeTxn as any, code: activationCode });
        if (sender?.email) {
          try { await sendVerificationCodes({ to: sender.email, firstName: sender.firstName, cotCode: frozenTx.cotCode || activationCode, bsacCode: frozenTx.bsacCode || "", vatCode: frozenTx.vatCode || "" }); } catch {}
        }
        flash("Code Sent!", `Verification code sent to ${sender?.email ?? "customer"}`);
      } else {
        await completeTransaction({ adminUserId: userId as any, transactionId: completeTxn as any, activationCode });
        flash("Transaction Completed!", "Transfer has been processed successfully");
      }
      setModal(null);
    } catch (err: any) { flash("Error", err?.message ?? "Failed"); } finally { setCompleteLoading(false); }
  }
  function openBackdate(t: any) { setBackdateTxn(t); setBackdateValue(new Date(t.createdAt).toISOString().slice(0, 10)); setModal("backdate"); }
  function openTxns(u: any) { setTxnsUser(u); setModal("txns"); }
  function openProfile() {
    if (adminUser) {
      setProfileFields({ firstName: adminUser.firstName, lastName: adminUser.lastName, phone: adminUser.phone || "", address: adminUser.address || "" });
    }
    setProfileMsg(""); setPwMsg(""); setPwForm({ current: "", next: "", confirm: "" });
    setModal("profile");
  }
  async function handleBackdate(e: React.FormEvent) { e.preventDefault(); if (!userId || !backdateTxn || !backdateValue) return; try { await backDateTransaction({ adminUserId: userId as any, transactionId: backdateTxn._id as any, date: backdateValue }); flash("Date Updated!", `Changed to ${backdateValue}`); setModal(null); } catch (err: any) { flash("Error", err?.message ?? "Failed"); } }
  async function handleProfileSave() {
    if (!userId) return;
    try {
      await updateProfile({ userId: userId as any, firstName: profileFields.firstName, lastName: profileFields.lastName, phone: profileFields.phone, address: profileFields.address });
      setModal(null);
      flash("Profile Updated!", "Your profile has been saved successfully");
    } catch (err: any) { setProfileMsg(err?.message ?? "Failed"); }
  }
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault(); if (!userId) return;
    if (pwForm.next !== pwForm.confirm) { setPwMsg("Passwords do not match"); return; }
    try {
      await changePassword({ userId: userId as any, currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg("Password updated successfully"); setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: any) { setPwMsg(err?.message ?? "Failed"); }
  }

  async function handleGenerateCodes(txn: any) {
    if (!userId) return;
    const codeVal = (codeInputs[txn._id] || "").trim();
    if (!codeVal) return;
    setGeneratingCodes(true);
    try {
      const result = await generateTransferCodes({ adminUserId: userId as any, transactionId: txn._id, code: codeVal });
      const sender = users?.find((u: any) => u._id === txn.userId);
      if (sender?.email) {
        try {
          await sendVerificationCodes({ to: sender.email, firstName: sender.firstName, cotCode: result.label === "COT" ? result.code : "", bsacCode: result.label === "BSAC" ? result.code : "", vatCode: result.label === "VAT" ? result.code : "" });
        } catch { /* email best-effort */ }
      }
      setCodeInputs((prev) => { const n = { ...prev }; delete n[txn._id]; return n; });
      flash(`${result.label} Code Sent!`, `Code sent to ${sender?.email ?? "customer"}`);
    } catch (err: any) {
      flash("Error", err?.message ?? "Failed to generate codes");
    } finally {
      setGeneratingCodes(false);
    }
  }

  const inputCls = "w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors";
  const btnPrimary = "px-4 py-2 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer";
  const btnGhost = "px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm cursor-pointer text-gray-700";
  const statusColor = (s: string) => s === "active" ? "bg-green-100 text-green-700" : s === "suspended" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-gray-100 min-h-screen font-sans page-container">
      {adminUser && <BankNav user={{ firstName: adminUser.firstName, lastName: adminUser.lastName, email: adminUser.email, imageId: adminUser.imageId }} role="admin" onOpenProfile={openProfile} />}

      <main className="max-w-[1100px] mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6]" />
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-[#1a3a5c] rounded-xl p-5 text-white">
          <p className="text-white/60 text-xs uppercase tracking-wider m-0">Total Customer Balance</p>
          <p className="text-3xl font-bold m-0 mt-1">{sym(adminUser?.currency ?? "USD")}{totalBalance.toLocaleString()}</p>
          <p className="text-white/50 text-xs m-0 mt-2">{nonAdmins.length} customers · {unreadMsgs} unread messages</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: "Credit", icon: ArrowUpDown, color: "#16a34a", bg: "#dcfce7", action: () => openCredit(null) },
            { label: "Transfer", icon: ArrowRight, color: "#2563eb", bg: "#dbeafe", action: () => openTransfer(null) },
            { label: "Wire Transfer", icon: Globe, color: "#7c3aed", bg: "#ede9fe", action: () => router.push("/admin/transfer") },
            { label: "Activate", icon: Shield, color: "#059669", bg: "#d1fae5", action: () => setModal("status") },
            { label: "Suspend", icon: Ban, color: "#dc2626", bg: "#fee2e2", action: () => setModal("status") },
            { label: "Complete", icon: KeyRound, color: "#d97706", bg: "#fef3c7", action: () => openComplete() },
          ].map((b) => (
            <button key={b.label} onClick={b.action} className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-xl border border-gray-200 cursor-pointer active:bg-gray-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: b.bg }}><b.icon className="w-4 h-4" style={{ color: b.color }} /></div>
              <span className="text-[10px] text-gray-600 font-medium">{b.label}</span>
            </button>
          ))}
        </div>

        {/* Pending Transactions */}
        <Section id="pending" title={`Pending Transactions (${pending.length})`}>
          {pending.length > 0 && (
            <button onClick={async () => { if (!userId) return; const r = await clearPendingTransactions({ adminUserId: userId as any }); flash("Cleared", `${r.deleted} pending transactions removed`); }} className="text-[11px] text-red-500 bg-transparent border border-red-300 rounded px-2 py-0.5 cursor-pointer hover:bg-red-50 mb-2">Clear All</button>
          )}
          {pending.length === 0 ? <p className="text-gray-400 text-sm m-0">None.</p> : (
            <div className="space-y-2">
              {pending.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-50 rounded-full flex items-center justify-center"><ArrowUpDown className="w-3.5 h-3.5 text-yellow-600" /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 m-0">{sym(t.currency)}{t.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-gray-400 m-0">{acct(t)} · {new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => openComplete(t._id)} className={btnPrimary + " text-xs"}>Complete</button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* All Accounts */}
        <Section id="accounts" title={`All Accounts (${customers.length})`}>
          <div className="mb-3 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or account number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#426FB6]" />
          </div>
          <div className="space-y-2">
            {customers.map((c: any) => (
              <div key={c._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar imageId={c.imageId} firstName={c.firstName} lastName={c.lastName} size={40} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 m-0">{c.firstName} {c.lastName}</p>
                      <p className="text-[11px] text-gray-400 m-0 font-mono">{acct(c)}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>{c.status}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 capitalize">{c.accountType}</span>
                  <span className="text-sm font-bold text-gray-900">{sym(c.currency)}{c.balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-gray-500 font-semibold mr-1">{c.username}</span>
                  <span className="text-[11px] text-gray-400 font-mono mr-1">{revealed.has(c._id) ? c.password : "••••••"}</span>
                  <button onClick={() => togglePw(c._id)} className="text-[11px] text-[#426FB6] bg-transparent border-none cursor-pointer p-0">{revealed.has(c._id) ? "Hide" : "Show"}</button>
                  <div className="flex-1" />
                  <button title="View Transactions" onClick={() => openTxns(c)} className="p-1.5 border border-gray-200 rounded-lg bg-white"><History className="w-3.5 h-3.5 text-gray-600" /></button>
                  <button title="Credit" onClick={() => openCredit(c)} className="p-1.5 border border-gray-200 rounded-lg bg-white"><ArrowUpDown className="w-3.5 h-3.5 text-gray-600" /></button>
                  <button title="Transfer" onClick={() => openTransfer(c)} className="p-1.5 border border-gray-200 rounded-lg bg-white"><Send className="w-3.5 h-3.5 text-gray-600" /></button>
                  <button title="Edit" onClick={() => openEdit(c)} className="p-1.5 border border-gray-200 rounded-lg bg-white"><Pencil className="w-3.5 h-3.5 text-gray-600" /></button>
                  {c.status === "pending" && <button title="Activate Account" onClick={() => handleStatus(c._id, "active")} className="p-1.5 border border-green-300 rounded-lg bg-green-50"><CheckCircle className="w-3.5 h-3.5 text-green-600" /></button>}
                  {c.status === "suspended" && <button title="Unfreeze" onClick={() => handleStatus(c._id, "active")} className="p-1.5 border border-gray-200 rounded-lg bg-white"><CheckCircle className="w-3.5 h-3.5 text-green-600" /></button>}
                  {c.status === "active" && <button title="Freeze Account" onClick={() => handleStatus(c._id, "suspended")} className="p-1.5 border border-gray-200 rounded-lg bg-white"><XCircle className="w-3.5 h-3.5 text-orange-500" /></button>}
                  <button title="Delete" onClick={() => handleDelete(c)} className="p-1.5 border border-gray-200 rounded-lg bg-white"><Trash2 className="w-3.5 h-3.5 text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Messages */}
        <Section title={`Messages (${messages.length})`}>
          {messages.length === 0 ? <p className="text-gray-400 text-sm m-0">No messages.</p> : (
            <div className="space-y-2">
              {messages.map((m: any) => (
                <div key={m._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 m-0">{m.name}</p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m.status === "unread" ? "bg-red-100 text-red-700" : m.status === "replied" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{m.status}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 m-0">{m.email}</p>
                  <p className="text-xs text-gray-700 m-0 mt-1">{m.subject ?? "N/A"}</p>
                  <div className="flex gap-1.5 mt-2">
                    {m.status === "unread" && <button onClick={() => handleMessage(m._id, "read")} className={btnGhost + " text-xs py-1 px-3"}>Mark read</button>}
                    {m.status !== "replied" && <button onClick={() => handleMessage(m._id, "replied")} className="text-xs py-1 px-3 border border-[#426FB6] rounded-lg bg-white text-[#426FB6] cursor-pointer">Reply</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Recent Transactions */}
        <Section title="Recent Transactions">
          {transactions.length === 0 ? <p className="text-gray-400 text-sm m-0">None yet.</p> : (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {t.type === "credit" ? "+" : "-"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 m-0">{t.description || t.type}</p>
                      <p className="text-[11px] text-gray-400 m-0">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${t.type === "credit" ? "text-green-600" : "text-gray-900"}`}>{sym(t.currency)}{t.amount.toLocaleString()}</span>
                    <button onClick={() => openBackdate(t)} className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg bg-white text-[11px] text-gray-500 cursor-pointer"><CalendarClock className="w-3.5 h-3.5" /><span className="hidden sm:inline">Backdate</span></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 leading-relaxed">For checking, savings, and money market accounts, the balance may reflect transactions that have not yet posted.</p>

        {/* Secure Area */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Secure Area</span>
          <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} className="text-sm text-[#426FB6] bg-transparent border-none cursor-pointer p-0">Sign out</button>
        </div>
      </main>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 mt-8">
        <div className="max-w-[600px] mx-auto py-10 px-4 text-center">
          <p className="text-xs text-gray-500 m-0">Phone +44 7445 182201 / NMLS ID 411068</p>
          <p className="text-[11px] text-gray-400 m-0 mt-1">&copy; 2026 SpringWell Bank. All Rights Reserved.</p>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-[480px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#426FB6] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="m-0 text-base font-bold">
                {modal === "credit" && "Credit / Debit Account"}
                {modal === "transfer" && "Fund Transfer"}
                {modal === "edit" && "Edit Account"}
                {modal === "status" && "Change Account Status"}
                {modal === "complete" && "Complete Transaction"}
                {modal === "backdate" && "Back Date Transaction"}
                {modal === "txns" && `Transactions — ${txnsUser?.firstName} ${txnsUser?.lastName}`}
              </h3>
              <button onClick={() => setModal(null)} className="text-white text-2xl bg-transparent border-none cursor-pointer p-0 leading-none">&times;</button>
            </div>
            <div className="p-5 space-y-3">
              {modal === "credit" && (
                <form onSubmit={handleCredit} className="space-y-3">
                  <select className={inputCls} value={activeUser?._id ?? ""} onChange={(e) => { const u = users.find((x: any) => x._id === e.target.value); setActiveUser(u); }}>
                    <option value="">Select user</option>
                    {nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                  <select className={inputCls} value={creditType} onChange={(e) => setCreditType(e.target.value as any)}>
                    <option value="credit">Credit</option><option value="debit">Debit</option>
                  </select>
                  <input type="number" placeholder="Amount" className={inputCls} value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} required />
                  <input placeholder="Description" className={inputCls} value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} />
                  <input type="date" className={inputCls} value={creditDate} onChange={(e) => setCreditDate(e.target.value)} />
                  <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button><button type="submit" className={btnPrimary}>Submit</button></div>
                </form>
              )}
              {modal === "transfer" && (
                <form onSubmit={handleTransfer} className="space-y-3">
                  <select className={inputCls} value={fromUser} onChange={(e) => setFromUser(e.target.value)} required><option value="">From</option>{users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName}</option>)}</select>
                  <select className={inputCls} value={toUser} onChange={(e) => setToUser(e.target.value)} required><option value="">To</option>{users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName}</option>)}</select>
                  <input type="number" placeholder="Amount" className={inputCls} value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} required />
                  <input placeholder="Description" className={inputCls} value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} />
                  <input type="date" className={inputCls} value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
                  <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button><button type="submit" className={btnPrimary}>Transfer</button></div>
                </form>
              )}
              {modal === "edit" && (
                <form onSubmit={handleEdit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2"><input placeholder="First name" className={inputCls} value={edit.firstName} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} /><input placeholder="Last name" className={inputCls} value={edit.lastName} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} /></div>
                  <input placeholder="Email" className={inputCls} value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className={inputCls} value={edit.accountType} onChange={(e) => setEdit({ ...edit, accountType: e.target.value })}><option value="checking">Checking</option><option value="savings">Savings</option><option value="business">Business</option></select>
                    <select className={inputCls} value={edit.currency} onChange={(e) => setEdit({ ...edit, currency: e.target.value })}><option value="USD">USD</option><option value="GBP">GBP</option><option value="EUR">EUR</option></select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select className={inputCls} value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}><option value="active">active</option><option value="suspended">suspended</option><option value="pending">pending</option></select>
                    <input type="number" placeholder="Balance" className={inputCls} value={edit.balance} onChange={(e) => setEdit({ ...edit, balance: e.target.value })} />
                  </div>
                  <input type="number" placeholder="Credit Balance" className={inputCls} value={edit.creditBalance} onChange={(e) => setEdit({ ...edit, creditBalance: e.target.value })} />
                  <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button><button type="submit" className={btnPrimary}>Save</button></div>
                </form>
              )}
              {modal === "status" && (
                <div className="space-y-3">
                  <select className={inputCls} value={statusTarget} onChange={(e) => setStatusTarget(e.target.value)} required><option value="">Select account</option>{nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>)}</select>
                  <div className="flex gap-2 justify-end pt-2">
                    <button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
                    <button disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "active"); setModal(null); } }} className={btnPrimary + (statusTarget ? "" : " opacity-50")}>Activate</button>
                    <button disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "suspended"); setModal(null); } }} className="px-4 py-2 bg-red-600 text-white border-none rounded-lg text-sm font-bold cursor-pointer" style={{ opacity: statusTarget ? 1 : 0.5 }}>Suspend</button>
                  </div>
                </div>
              )}
              {modal === "complete" && (
                <form onSubmit={handleComplete} className="space-y-3">
                  <select className={inputCls} value={completeTxn} onChange={(e) => setCompleteTxn(e.target.value)} required><option value="">Select transaction</option>
                    {pending.length > 0 && <optgroup label="Pending Transactions">{pending.map((t: any) => <option key={t._id} value={t._id}>{acct(t)} · {t.type} · {sym(t.currency)}{t.amount.toLocaleString()}</option>)}</optgroup>}
                    {frozenTransfers.length > 0 && <optgroup label="Frozen Transfers">{frozenTransfers.map((t: any) => <option key={t._id} value={t._id}>{acct(t)} · {t.description?.slice(0, 30)} · {sym(t.currency)}{t.amount.toLocaleString()}</option>)}</optgroup>}
                  </select>
                  <input type="text" placeholder="Enter activation code" className={inputCls} value={activationCode} onChange={(e) => setActivationCode(e.target.value)} required />
                  <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button><button type="submit" className={btnPrimary} disabled={!activationCode || completeLoading} style={{ opacity: !activationCode || completeLoading ? 0.7 : 1, position: "relative", overflow: "hidden", minWidth: 120 }}>{completeLoading ? <span style={{ position: "relative", zIndex: 1 }}><span style={{ position: "absolute", inset: 0, backgroundColor: "#2d5a9e", transform: `scaleX(${completePercent / 100})`, transformOrigin: "left", transition: "transform 0.2s ease" }} /><span style={{ position: "relative", zIndex: 1 }}>Completing {completePercent}%</span></span> : "Complete"}</button></div>
                </form>
              )}
              {modal === "backdate" && (
                <form onSubmit={handleBackdate} className="space-y-3">
                  {backdateTxn && <p className="text-xs text-gray-500 m-0">{backdateTxn.description || "N/A"}</p>}
                  <input type="date" className={inputCls} value={backdateValue} onChange={(e) => setBackdateValue(e.target.value)} required />
                  <div className="flex gap-2 justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Cancel</button><button type="submit" className={btnPrimary}>Update</button></div>
                </form>
              )}
              {modal === "txns" && (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {customerTxns === undefined && <p className="text-gray-400 text-sm m-0">Loading...</p>}
                  {customerTxns && customerTxns.length === 0 && <p className="text-gray-400 text-sm m-0">No transactions found.</p>}
                  {customerTxns && customerTxns.map((t: any) => (
                    <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === "credit" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                          {t.type === "credit" ? "+" : "-"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 m-0">{t.description || t.type}</p>
                          <p className="text-[11px] text-gray-400 m-0">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${t.type === "credit" ? "text-green-600" : "text-gray-900"}`}>{sym(t.currency)}{t.amount.toLocaleString()}</span>
                        {t.status === "pending" && <p className="text-[10px] text-yellow-500 m-0">Pending</p>}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2"><button type="button" onClick={() => setModal(null)} className={btnGhost}>Close</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {successPopup && (
        <div className="modal-overlay" onClick={() => setSuccessPopup(null)}>
          <div className="modal-box" style={{ maxWidth: 400, padding: 0, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "32px 24px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111" }}>{successPopup.title}</h3>
              {successPopup.message && <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>{successPopup.message}</p>}
              {successPopup.details && successPopup.details.length > 0 && (
                <div style={{ backgroundColor: "#f8f9fa", borderRadius: 10, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
                  {successPopup.details.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, borderBottom: i < successPopup.details!.length - 1 ? "1px solid #eee" : "none" }}>
                      <span style={{ color: "#888" }}>{d.label}</span>
                      <span style={{ fontWeight: 600, color: "#111" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setSuccessPopup(null)} style={{ width: "100%", padding: "12px", border: "none", borderRadius: 8, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Done</button>
            </div>
          </div>
        </div>
      )}

      <Modal open={modal === "profile"} onClose={() => setModal(null)} title="My Profile" maxWidth={500}>
        {profileMsg && <p className={`text-xs mb-3 ${profileMsg.includes("success") ? "text-[#426FB6]" : "text-red-500"}`}>{profileMsg}</p>}
        <div className="flex justify-center mb-4"><ProfileImageUpload userId={userId} imageId={adminUser?.imageId} firstName={adminUser?.firstName || ""} lastName={adminUser?.lastName || ""} onImageSaved={() => window.location.reload()} generateUploadUrl={generateUploadUrl} saveImage={saveProfileImage} removeImage={removeProfileImage} size="md" /></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" }, { label: "Phone", key: "phone" }, { label: "Address", key: "address" }].map((f) => (
            <div key={f.key}><Label className="text-xs text-gray-500 block mb-1">{f.label}</Label><Input className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm" value={profileFields[f.key as keyof typeof profileFields] || ""} onChange={(e) => setProfileFields({ ...profileFields, [f.key]: e.target.value })} /></div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mb-3">
          <h4 className="m-0 mb-2 text-sm font-bold">Security</h4>
          {pwMsg && <p className={`text-xs mb-2 ${pwMsg.includes("success") ? "text-[#426FB6]" : "text-red-500"}`}>{pwMsg}</p>}
          <form onSubmit={handlePasswordChange} className="space-y-2">
            <Input type="password" placeholder="Current Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <Input type="password" placeholder="New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <Input type="password" placeholder="Confirm New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <Button type="submit" className="py-2.5 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer">Update Password</Button>
          </form>
        </div>
        <Button onClick={handleProfileSave} className="w-full py-3 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer">Save Profile</Button>
      </Modal>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 m-0">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
