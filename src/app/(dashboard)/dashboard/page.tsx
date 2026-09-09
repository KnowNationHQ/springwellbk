"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogoSpinner } from "@/components/logo-spinner";
import { ArrowUpRight, ArrowDownLeft, Bell, DollarSign, Tag, FileText, PiggyBank, Target, Wallet } from "lucide-react";
import { BankNav } from "@/components/layout/bank-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sym, displayDate } from "@/lib/format";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { DashboardFooter, DashboardFullFooter } from "@/components/layout/dashboard-footer";

  type ModalName = "transfer" | "profile" | "alerts" | "offers" | "messages" | "spending" | "goals";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});
  const [transferForm, setTransferForm] = useState({ toEmail: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferBusy, setTransferBusy] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [msgForm, setMsgForm] = useState({ subject: "", message: "" });
  const [msgMsg, setMsgMsg] = useState("");
  const [msgBusy, setMsgBusy] = useState(false);
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);
  const transfer = useMutation(api.auth.transfer);
  const createMessage = useMutation(api.messages.create);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const saveProfileImage = useMutation(api.auth.saveProfileImage);
  const removeProfileImage = useMutation(api.auth.removeProfileImage);
  const verifyTransferCode = useMutation(api.auth.verifyTransferCode);
  const customerComplete = useMutation(api.auth.customerCompleteTransaction);

  const [frozenVerifyTxn, setFrozenVerifyTxn] = useState<any>(null);
  const [frozenStep, setFrozenStep] = useState<"cot" | "bsac" | "vat" | "completed">("cot");
  const [frozenCode, setFrozenCode] = useState("");
  const [frozenLoading, setFrozenLoading] = useState(false);
  const [frozenPercent, setFrozenPercent] = useState(0);
  const [frozenError, setFrozenError] = useState("");
  const [frozenSuccess, setFrozenSuccess] = useState("");

  const [pendingVerifyTxn, setPendingVerifyTxn] = useState<any>(null);
  const [pendingCode, setPendingCode] = useState("");
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPercent, setPendingPercent] = useState(0);
  const [pendingError, setPendingError] = useState("");
  const [pendingSuccess, setPendingSuccess] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  useEffect(() => {
    if (!frozenLoading) { setFrozenPercent(0); return; }
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct > 92) pct = 92;
      setFrozenPercent(Math.floor(pct));
    }, 200);
    return () => clearInterval(iv);
  }, [frozenLoading]);

  useEffect(() => {
    if (!pendingLoading) { setPendingPercent(0); return; }
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 8 + 2;
      if (pct > 92) pct = 92;
      setPendingPercent(Math.floor(pct));
    }, 200);
    return () => clearInterval(iv);
  }, [pendingLoading]);

  useEffect(() => {
    if (!activeModal) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setActiveModal(null); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeModal]);

  const stats = useQuery(api.auth.getDashboardStats, userId ? { userId: userId as any } : "skip");

  useEffect(() => {
    if (activeModal === "profile" && stats?.user) {
      const u = stats.user;
      setProfileFields({ firstName: u.firstName || "", lastName: u.lastName || "", phone: (u as any).phone || "", address: (u as any).address || "" });
    }
  }, [activeModal, stats?.user]);

  if (!userId || !stats) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><LogoSpinner /></div>;
  }

  const { user, transactions } = stats;
  const cardLast4 = (userId?.replace(/[^0-9]/g, "").slice(-4)) || "4242";
  const cardNumber = `**** **** **** ${cardLast4}`;

  async function handleProfileSave() {
    setProfileMsg("");
    try {
      await updateProfile({ userId: userId as any, ...profileFields });
      setProfileMsg("Profile updated successfully.");
      setToastMsg("Profile updated successfully!");
      setTimeout(() => { setActiveModal(null); setProfileMsg(""); }, 500);
    } catch (err: any) { setProfileMsg(err.message || "Failed to update profile."); }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError(""); setTransferSuccess(""); setTransferBusy(true);
    try {
      const amt = parseFloat(transferForm.amount);
      if (!transferForm.toEmail || isNaN(amt) || amt <= 0) throw new Error("Enter a valid recipient email and amount");
      await transfer({ fromUserId: userId as any, toEmail: transferForm.toEmail, amount: amt, description: transferForm.description || undefined });
      setTransferForm({ toEmail: "", amount: "", description: "" });
      setTransferSuccess("Transfer sent successfully!");
      setToastMsg("Transfer sent successfully!");
      setTimeout(() => { setActiveModal(null); setTransferSuccess(""); }, 500);
    } catch (err: any) { setTransferError(err.message || "Transfer failed"); }
    finally { setTransferBusy(false); }
  }

  async function handleFrozenVerify() {
    if (!frozenVerifyTxn || !frozenCode.trim() || frozenStep === "completed") return;
    setFrozenLoading(true);
    setFrozenError("");
    setFrozenSuccess("");
    try {
      const result = await verifyTransferCode({
        transactionId: frozenVerifyTxn._id,
        codeType: frozenStep,
        code: frozenCode.trim(),
        userId: userId as any,
      });
      setFrozenPercent(100);
      setFrozenSuccess((result as any).message);
      setFrozenCode("");
      if (frozenStep === "cot") setFrozenStep("bsac");
      else if (frozenStep === "bsac") setFrozenStep("vat");
      else setFrozenStep("completed");
    } catch (err: any) {
      setFrozenError(err.message || "Invalid code");
    } finally {
      setFrozenLoading(false);
    }
  }

  async function handlePendingVerify() {
    if (!userId || !pendingVerifyTxn || !pendingCode.trim()) return;
    setPendingLoading(true); setPendingError(""); setPendingSuccess("");
    try {
      await customerComplete({ userId: userId as any, transactionId: pendingVerifyTxn._id, activationCode: pendingCode.trim() });
      setPendingPercent(100);
      setPendingSuccess("Transaction completed successfully!");
      setTimeout(() => { setPendingVerifyTxn(null); setPendingCode(""); setPendingSuccess(""); }, 2000);
    } catch (err: any) { setPendingError(err?.message ?? "Verification failed"); }
    finally { setPendingLoading(false); }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg("");
    if (pwForm.next !== pwForm.confirm) { setPwMsg("New passwords do not match"); return; }
    try {
      await changePassword({ userId: userId as any, currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwMsg("Password updated successfully."); setPwForm({ current: "", next: "", confirm: "" });
      setToastMsg("Password updated successfully!");
    } catch (err: any) { setPwMsg(err.message || "Could not update password"); }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    setMsgMsg(""); setMsgBusy(true);
    try {
      if (!msgForm.message.trim()) throw new Error("Please enter a message");
      await createMessage({ name: `${user.firstName} ${user.lastName}`, email: user.email, subject: msgForm.subject || undefined, message: msgForm.message });
      setMsgForm({ subject: "", message: "" });
      setMsgMsg("Message sent successfully!");
      setToastMsg("Message sent successfully!");
      setTimeout(() => { setActiveModal(null); setMsgMsg(""); }, 500);
    } catch (err: any) { setMsgMsg(err.message || "Failed to send"); }
    finally { setMsgBusy(false); }
  }

  const openModal = (name: ModalName) => setActiveModal(name);

  const activityItems = [
    { label: "Alerts", icon: Bell, modal: "alerts" as const },
    { label: "Transfer Funds", icon: ArrowUpRight, route: "/transfer" },
    { label: "Special Offers", icon: Tag, modal: "offers" as const },
    { label: "Messages", icon: FileText, modal: "messages" as const },
    { label: "Spending & Budgeting", icon: PiggyBank, modal: "spending" as const },
    { label: "Profile", icon: Target, modal: "profile" as const },
  ];

  return (
    <div className="bg-gray-100 min-h-screen font-sans page-container">
      <BankNav user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, imageId: user.imageId }} onOpenProfile={() => setActiveModal("profile")} />

      {user.status === "pending" && (
        <div className="max-w-[900px] mx-auto px-4 pt-2">
          <div style={{ backgroundColor: "#dbeafe", border: "1px solid #3b82f6", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1e40af" }}>Account pending activation</p>
              <p style={{ margin: 0, fontSize: 12, color: "#2563eb" }}>Your account is awaiting admin approval. You will be able to make transactions once activated.</p>
            </div>
          </div>
        </div>
      )}

      {user.status === "suspended" && (
        <div className="max-w-[900px] mx-auto px-4 pt-2">
          <div style={{ backgroundColor: "#fef3c7", border: "1px solid #f59e0b", borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#92400e" }}>Your account is frozen</p>
              <p style={{ margin: 0, fontSize: 12, color: "#a16207" }}>Transfers require verification codes from SpringWell Bank. Contact your account manager for COT, BSAC, and VAT codes.</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[900px] mx-auto px-4 py-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-[#1a3a5c] rounded-xl p-5 text-white">
          <p className="text-white/60 text-xs uppercase tracking-wider m-0">Available Balance</p>
          <p className="text-3xl font-bold m-0 mt-1">{sym(user.currency)}{user.balance.toLocaleString()}</p>
          <p className="text-white/50 text-xs m-0 mt-2">SpringWell Bank Core checking · {cardNumber}</p>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Transfer", icon: ArrowUpRight, action: () => router.push("/transfer") },
            { label: "Pay Bill", icon: DollarSign, action: () => router.push("/transfer") },
            { label: "Deposit", icon: Wallet, action: () => router.push("/transfer") },
            { label: "More", icon: Target, action: () => {} },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => item.action()} className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-lg border border-gray-200 cursor-pointer active:bg-gray-50 transition-colors">
                <Icon className="w-5 h-5 text-[#426FB6]" />
                <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accounts */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 m-0">Accounts</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 m-0">Checking · 9080</p>
                <p className="text-xs text-gray-400 m-0 mt-0.5">{cardNumber}</p>
              </div>
              <p className="text-xl font-bold text-gray-900 m-0">{sym(user.currency)}{user.balance.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Transactions */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 m-0">Recent Transactions</h3>
          </div>
          <div className="p-3 space-y-2">
            {transactions.length === 0 ? (
              <p className="text-gray-400 text-sm m-0">No transactions yet.</p>
            ) : transactions.slice(0, 10).map((t: any) => (
              <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-green-50" : "bg-red-50"}`}>
                    {t.type === "credit" ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" /> : <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 m-0">{t.description || t.type}</p>
                    {t.senderName && <p className="text-[11px] text-gray-500 m-0">From: {t.senderName}</p>}
                    <p className="text-[11px] text-gray-400 m-0">{displayDate(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {displayDate(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold whitespace-nowrap ${t.type === "credit" ? "text-green-600" : "text-gray-900"}`}>
                    {t.type === "credit" ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
                  </span>
                  <p className={`text-[11px] font-semibold m-0 mt-0.5 px-2 py-0.5 rounded-full inline-block ${t.type === "credit" ? "bg-green-100 text-green-700" : t.type === "debit" ? "bg-red-100 text-red-700" : t.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.type === "credit" ? "Credited" : t.type === "debit" ? "Debited" : t.status === "pending" ? "Pending" : "Transfer"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Incoming Transactions */}
        {transactions.some((t: any) => t.type === "credit") && (
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 m-0">Incoming Transactions</h3>
              <span className="text-[11px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">{transactions.filter((t: any) => t.type === "credit").length} credits</span>
            </div>
            <div className="p-3 space-y-2">
              {transactions.filter((t: any) => t.type === "credit").slice(0, 10).map((t: any) => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-green-50/50 rounded-lg border-l-4 border-l-green-400">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowDownLeft className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 m-0">{t.description || "Incoming transfer"}</p>
                      {t.senderName && <p className="text-[11px] text-gray-500 m-0">From: {t.senderName}</p>}
                      <p className="text-[11px] text-gray-400 m-0">{displayDate(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {displayDate(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600 whitespace-nowrap">+{sym(t.currency)}{t.amount.toLocaleString()}</span>
<p className={`text-[11px] font-semibold m-0 mt-0.5 px-2 py-0.5 rounded-full inline-block ${t.type === "credit" ? "bg-green-100 text-green-700" : t.type === "debit" ? "bg-red-100 text-red-700" : t.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{t.type === "credit" ? "Credited" : t.type === "debit" ? "Debited" : t.status === "pending" ? "Pending" : "Transfer"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Card */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 m-0">My Card</h3>
            <p className="text-[11px] text-gray-400 m-0 mt-0.5">SpringWell Bank Debit, {cardLast4}</p>
          </div>
          <div className="p-4">
            <div className="w-full max-w-[360px] h-[220px] mx-auto [perspective:1000px] cursor-pointer group">
              <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* Front */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl [backface-visibility:hidden]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                  <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 20%, rgba(66,111,182,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(254,223,1,0.15) 0%, transparent 40%)" }} />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white" style={{ position: "relative", zIndex: 1 }}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-7 rounded" style={{ background: "linear-gradient(135deg, #d4a843 0%, #f0d78c 40%, #c9952a 60%, #f0d78c 100%)", boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)" }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-3 border border-[#b8860b]/40 rounded-sm" style={{ background: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(184,134,11,0.15) 2px, rgba(184,134,11,0.15) 3px)" }} />
                          </div>
                        </div>
                        <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 1C5.34 1 4 2.34 4 4C4 5.66 5.34 7 7 7H3V1H7ZM3 8H7C7 9.66 5.66 11 4 11C2.34 11 1 9.66 1 8C1 6.34 2.34 5 4 5H3V8Z" fill="white" fillOpacity="0.5"/>
                        </svg>
                      </div>
                      <div className="flex items-center gap-0">
                        <div className="w-8 h-8 rounded-full bg-[#EB001B] opacity-90" />
                        <div className="w-8 h-8 rounded-full bg-[#F79E1B] opacity-90 -ml-3" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[17px] tracking-[0.2em] font-mono font-medium m-0 mb-4" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{cardNumber}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] tracking-[0.15em] m-0 opacity-50 uppercase">Card Holder</p>
                          <p className="text-[13px] font-semibold m-0 tracking-wide uppercase">{user.firstName} {user.lastName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] tracking-[0.15em] m-0 opacity-50 uppercase">Expires</p>
                          <p className="text-[13px] font-semibold m-0 tracking-wide">10/2028</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] tracking-[0.15em] m-0 opacity-50 uppercase">Network</p>
                          <p className="text-[12px] font-bold m-0 tracking-wider text-[#FEDF01]">MASTERCARD</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Back */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#16213e] via-[#1a1a2e] to-[#0f3460]" />
                  <div className="absolute inset-0" style={{ position: "relative" }}>
                    <div className="w-full h-12 bg-black/60 mt-6" />
                    <div className="px-6 mt-6">
                      <div className="bg-white/15 backdrop-blur-sm rounded px-4 py-2.5 flex items-center justify-between border border-white/10">
                        <div className="flex-1" />
                        <div className="bg-white rounded px-4 py-1.5">
                          <span className="text-[11px] font-bold tracking-[0.2em] text-[#1a1a2e] font-mono">{cardLast4}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <p className="text-[8px] tracking-[0.15em] m-0 opacity-40 uppercase text-white">Customer Service</p>
                          <p className="text-[11px] font-medium m-0 text-white/70">1-800-SPRWELL</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          </div>
                          <span className="text-[9px] text-white/50">springwellbk.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Grid */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 m-0">Quick Actions</h3>
          </div>
          <div className="p-3 grid grid-cols-3 gap-2">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} onClick={() => "route" in item && item.route ? router.push(item.route) : openModal(item.modal!)} className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg cursor-pointer active:bg-gray-50 transition-colors border-0 bg-transparent">
                  <Icon className="w-5 h-5 text-[#426FB6]" />
                  <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <DashboardFooter lastLogin={user.lastLogin} />
      </main>

      <DashboardFullFooter />

      {/* Transfer Modal */}
      <Modal open={activeModal === "transfer"} onClose={() => setActiveModal(null)} title="Transfer Funds" maxWidth={420}>
        <form onSubmit={handleTransfer} className="space-y-3">
          {transferError && <p className="text-xs bg-red-50 p-2 rounded text-red-600">{transferError}</p>}
          {transferSuccess && <p className="text-xs bg-blue-50 p-2 rounded text-[#426FB6]">{transferSuccess}</p>}
          <div><Label className="text-xs text-gray-500 block mb-1">Recipient email</Label><Input type="email" required placeholder="friend@springwellbk.com" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors outline-none focus:border-[#426FB6] transition-colors" value={transferForm.toEmail} onChange={(e) => setTransferForm({ ...transferForm, toEmail: e.target.value })} /></div>
          <div><Label className="text-xs text-gray-500 block mb-1">Amount ({user.currency})</Label><Input type="number" required min="0.01" step="0.01" placeholder="0.00" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors outline-none focus:border-[#426FB6] transition-colors" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} /></div>
          <div><Label className="text-xs text-gray-500 block mb-1">Note (optional)</Label><Input placeholder="Dinner, rent, etc." className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors outline-none focus:border-[#426FB6] transition-colors" value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} /></div>
          <p className="text-xs text-gray-400 m-0">Available: {sym(user.currency)}{user.balance.toLocaleString()}</p>
          <Button type="submit" className="w-full py-3 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer" disabled={transferBusy}>{transferBusy ? "Sending..." : "Send Transfer"}</Button>
        </form>
      </Modal>

      {/* Profile Modal */}
      <Modal open={activeModal === "profile"} onClose={() => setActiveModal(null)} title="Profile" maxWidth={500}>
        {profileMsg && <p className={`text-xs mb-3 ${profileMsg.includes("success") ? "text-[#426FB6]" : "text-red-500"}`}>{profileMsg}</p>}
        <div className="flex justify-center mb-4"><ProfileImageUpload userId={userId} imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} onImageSaved={() => window.location.reload()} generateUploadUrl={generateUploadUrl} saveImage={saveProfileImage} removeImage={removeProfileImage} size="md" /></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ label: "First Name", key: "firstName" }, { label: "Last Name", key: "lastName" }, { label: "Phone", key: "phone" }, { label: "Address", key: "address" }].map((f) => (
            <div key={f.key}><Label className="text-xs text-gray-500 block mb-1">{f.label}</Label><Input className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors" value={profileFields[f.key] || ""} onChange={(e) => setProfileFields({ ...profileFields, [f.key]: e.target.value })} /></div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mb-3">
          <h4 className="m-0 mb-2 text-sm font-bold">Security</h4>
          {pwMsg && <p className={`text-xs mb-2 ${pwMsg.includes("success") ? "text-[#426FB6]" : "text-red-500"}`}>{pwMsg}</p>}
          <form onSubmit={handlePasswordChange} className="space-y-2">
            <Input type="password" placeholder="Current Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <Input type="password" placeholder="New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <Input type="password" placeholder="Confirm New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <Button type="submit" className="py-2.5 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer">Update Password</Button>
          </form>
        </div>
        <Button onClick={handleProfileSave} className="w-full py-3 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer">Save Profile</Button>
      </Modal>

      {/* Modals */}
      <Modal open={activeModal === "alerts"} onClose={() => setActiveModal(null)} title="Alerts">
        <div className="p-6 text-center text-gray-400"><Bell className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm m-0">No new alerts</p></div>
      </Modal>

      <Modal open={activeModal === "offers"} onClose={() => setActiveModal(null)} title="Special Offers" maxWidth={500}>
        <div className="space-y-3">
          {[{ title: "5% Cash Back on Dining", desc: "Use your SpringWell card at restaurants this month.", badge: "Limited" }, { title: "0% APR for 12 Months", desc: "Open a new credit card with 0% intro APR.", badge: "New" }, { title: "Refer a Friend, Get $50", desc: "Invite friends and you both earn $50.", badge: "Ongoing" }].map((o, i) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-1"><h4 className="m-0 text-sm font-bold text-gray-700 min-w-0 flex-1 truncate">{o.title}</h4><span className="text-[11px] bg-[#FEDF01] text-black px-2 py-0.5 rounded-full font-semibold shrink-0 whitespace-nowrap">{o.badge}</span></div>
              <p className="m-0 text-xs text-gray-500">{o.desc}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={activeModal === "messages"} onClose={() => setActiveModal(null)} title="Messages">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {msgMsg && <p className={`text-xs ${msgMsg.includes("success") ? "text-[#426FB6]" : "text-red-500"}`}>{msgMsg}</p>}
          <div><Label className="text-xs text-gray-500 block mb-1">To</Label><Input value="SpringWell Support" disabled className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors bg-gray-50" /></div>
          <div><Label className="text-xs text-gray-500 block mb-1">Subject</Label><Input placeholder="How can we help?" className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors" value={msgForm.subject} onChange={(e) => setMsgForm({ ...msgForm, subject: e.target.value })} /></div>
          <div><Label className="text-xs text-gray-500 block mb-1">Message</Label><textarea required placeholder="Type your message..." rows={4} className="w-full p-2.5 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#426FB6] transition-colors font-sans resize-y" value={msgForm.message} onChange={(e) => setMsgForm({ ...msgForm, message: e.target.value })} /></div>
          <Button type="submit" className="w-full py-3 bg-[#426FB6] text-white border-none rounded-lg text-sm font-bold cursor-pointer" disabled={msgBusy}>{msgBusy ? "Sending..." : "Send Message"}</Button>
        </form>
      </Modal>

      <Modal open={activeModal === "spending"} onClose={() => setActiveModal(null)} title="Spending & Budgeting">
        <div className="text-center mb-4"><p className="text-xs text-gray-500 m-0">Current Balance</p><p className="text-2xl font-bold m-0 text-gray-800">{sym(user.currency)}{user.balance.toLocaleString()}</p></div>
        <div className="space-y-3">
          {[{ cat: "Housing", spent: 0, budget: 1500, color: "#426FB6" }, { cat: "Food & Dining", spent: 0, budget: 600, color: "#16a34a" }, { cat: "Transportation", spent: 0, budget: 300, color: "#f59e0b" }, { cat: "Entertainment", spent: 0, budget: 200, color: "#d93939" }, { cat: "Utilities", spent: 0, budget: 250, color: "#8b5cf6" }].map((b) => (
            <div key={b.cat}><div className="flex justify-between mb-1"><span className="text-xs font-medium text-gray-700">{b.cat}</span><span className="text-[10px] text-gray-400">${b.spent} / ${b.budget}</span></div><div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(b.spent / b.budget) * 100}%`, backgroundColor: b.color }} /></div></div>
          ))}
        </div>
      </Modal>

      {frozenVerifyTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setFrozenVerifyTxn(null)}>
          <div className="w-full max-w-[420px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", padding: "16px 20px" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Verify Transfer Code</h3>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Your account is frozen. Contact your account manager for the verification code.</p>
              {frozenSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#16a34a", fontSize: 13, textAlign: "center", fontWeight: 600 }}>{frozenSuccess}</div>
              )}
              {frozenError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13, textAlign: "center" }}>{frozenError}</div>
              )}
              {frozenStep !== "completed" ? (
                <>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>{frozenStep.toUpperCase()} Code</label>
                  <input value={frozenCode} onChange={(e) => setFrozenCode(e.target.value)} placeholder={`Enter ${frozenStep.toUpperCase()} code`}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", boxSizing: "border-box" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleFrozenVerify(); }} autoFocus />
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>&#10003;</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#16a34a", margin: "0 0 4px" }}>Transfer Successful!</p>
                  <p style={{ fontSize: 13, color: "#666", margin: 0 }}>All verification codes confirmed.</p>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {frozenStep !== "completed" && (
                  <button onClick={() => setFrozenVerifyTxn(null)} style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: 6, backgroundColor: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>
                )}
                {frozenStep !== "completed" ? (
                  <button onClick={handleFrozenVerify} disabled={frozenLoading || !frozenCode.trim()} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: frozenLoading || !frozenCode.trim() ? 0.7 : 1, position: "relative", overflow: "hidden" }}>
                    {frozenLoading ? (
                      <span style={{ position: "relative", zIndex: 1 }}>
                        <span style={{ position: "absolute", inset: 0, backgroundColor: "#2d5a9e", transform: `scaleX(${frozenPercent / 100})`, transformOrigin: "left", transition: "transform 0.2s ease" }} />
                        <span style={{ position: "relative", zIndex: 1 }}>Verifying {frozenPercent}%</span>
                      </span>
                    ) : `Verify ${frozenStep.toUpperCase()}`}
                  </button>
                ) : (
                  <button onClick={() => { setFrozenVerifyTxn(null); setFrozenStep("cot"); }} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {pendingVerifyTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPendingVerifyTxn(null)}>
          <div className="w-full max-w-[420px] bg-white rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#426FB6", padding: "16px 20px" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Complete Transaction</h3>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px" }}>Enter the activation code to complete this transaction.</p>
              {pendingSuccess && (
                <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#16a34a", fontSize: 13, textAlign: "center", fontWeight: 600 }}>{pendingSuccess}</div>
              )}
              {pendingError && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13, textAlign: "center" }}>{pendingError}</div>
              )}
              {!pendingSuccess && (
                <>
                  <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Activation Code</label>
                  <input value={pendingCode} onChange={(e) => setPendingCode(e.target.value)} placeholder="Enter activation code"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: 4, fontSize: 14, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", boxSizing: "border-box" }}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePendingVerify(); }} autoFocus />
                </>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {!pendingSuccess && <button onClick={() => setPendingVerifyTxn(null)} style={{ flex: 1, padding: "12px", border: "1px solid #ccc", borderRadius: 6, backgroundColor: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Cancel</button>}
                {!pendingSuccess ? (
                  <button onClick={handlePendingVerify} disabled={pendingLoading || !pendingCode.trim()} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#426FB6", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, opacity: pendingLoading || !pendingCode.trim() ? 0.7 : 1, position: "relative", overflow: "hidden" }}>
                    {pendingLoading ? (
                      <span style={{ position: "relative", zIndex: 1 }}>
                        <span style={{ position: "absolute", inset: 0, backgroundColor: "#2d5a9e", transform: `scaleX(${pendingPercent / 100})`, transformOrigin: "left", transition: "transform 0.2s ease" }} />
                        <span style={{ position: "relative", zIndex: 1 }}>Completing {pendingPercent}%</span>
                      </span>
                    ) : "Complete"}
                  </button>
                ) : (
                  <button onClick={() => { setPendingVerifyTxn(null); setPendingCode(""); setPendingSuccess(""); }} style={{ flex: 1, padding: "12px", border: "none", borderRadius: 6, backgroundColor: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Done</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
    </div>
  );
}
