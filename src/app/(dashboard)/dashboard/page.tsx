"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { ArrowUpRight, Clock, Bell, DollarSign, Tag, FileText, PiggyBank, Target, UserPlus } from "lucide-react";
import { BankNav } from "@/components/layout/bank-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sym } from "@/lib/format";
import { ProfileImageUpload } from "@/components/profile-image-upload";
import { Modal } from "@/components/ui/modal";
import { DashboardFooter, DashboardFullFooter } from "@/components/layout/dashboard-footer";

type ModalName = "transfer" | "profile" | "alerts" | "billPay" | "transactions" | "offers" | "messages" | "spending" | "goals" | "openAccount";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalName | null>(null);
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});
  const [transferForm, setTransferForm] = useState({ toEmail: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [transferBusy, setTransferBusy] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [quickView, setQuickView] = useState<string | null>(null);
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);
  const transfer = useMutation(api.auth.transfer);
  const generateUploadUrl = useMutation(api.auth.generateUploadUrl);
  const saveProfileImage = useMutation(api.auth.saveProfileImage);
  const removeProfileImage = useMutation(api.auth.removeProfileImage);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  useEffect(() => {
    if (!activeModal) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveModal(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeModal]);

  const stats = useQuery(
    api.auth.getDashboardStats,
    userId ? { userId: userId as any } : "skip"
  );

  if (!userId || !stats) {
    return <div className="min-h-screen flex items-center justify-center bg-[#eee]"><p className="text-gray-500">Loading...</p></div>;
  }

  const { user, transactions } = stats;
  const cardLast4 = (userId?.replace(/[^0-9]/g, "").slice(-4)) || "4242";
  const cardNumber = `**** **** **** ${cardLast4}`;

  async function handleProfileSave() {
    setProfileMsg("");
    try {
      await updateProfile({ userId: userId as any, ...profileFields });
      setProfileMsg("Profile updated successfully.");
      setActiveModal(null);
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
      setTimeout(() => { setActiveModal(null); setTransferSuccess(""); }, 2000);
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

  const openModal = (name: ModalName) => setActiveModal(name);

  const activityItems = [
    { label: "Alerts", icon: Bell, modal: "alerts" as const },
    { label: "Bill Pay", icon: DollarSign, modal: "billPay" as const },
    { label: "Transactions", icon: Clock, modal: "transactions" as const },
    { label: "Transfer Funds", icon: ArrowUpRight, modal: "transfer" as const },
    { label: "Special Offers", icon: Tag, modal: "offers" as const },
    { label: "Messages", icon: FileText, modal: "messages" as const },
    { label: "Spending & Budgeting", icon: PiggyBank, modal: "spending" as const },
    { label: "Goals", icon: Target, modal: "goals" as const },
    { label: "Open account", icon: UserPlus, modal: "openAccount" as const },
  ];

  return (
    <div className="bg-[#eee] min-h-screen font-['Hind',Arial,sans-serif]">
      <BankNav user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, imageId: user.imageId }} />

      <div className="max-w-[1100px] mx-auto px-5">
        {/* Personal Accounts */}
        <div className="bg-white border border-gray-300 rounded mb-5">
          <div className="border-b-2 border-[#426FB6] p-3 px-5">
            <h3 className="text-base font-bold m-0 text-black">Personal accounts</h3>
          </div>
          <div className="p-4 px-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="text-sm text-gray-700 m-0 mb-1">SpringWell Bank Core checking - 9080</p>
                <p className="text-xs text-gray-500 m-0">Account Number - {cardNumber}</p>
              </div>
              <p className="text-[28px] font-bold text-black m-0">{sym(user.currency)}{user.balance.toLocaleString()}</p>
            </div>
            <button onClick={() => setQuickView(quickView === "personal" ? null : "personal")} className="bg-transparent border-none text-[#426FB6] cursor-pointer text-sm p-0 mt-3">{quickView === "personal" ? "Hide" : "Quick view"}</button>
            {quickView === "personal" && (
              <div className="mt-3 p-3 bg-[#f9f9f9] rounded border border-[#eee]">
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[11px] text-gray-400 m-0">Account Type</p><p className="text-[13px] mt-0.5 font-medium">Checking</p></div>
                  <div><p className="text-[11px] text-gray-400 m-0">Routing Number</p><p className="text-[13px] mt-0.5 font-medium">021000021</p></div>
                  <div><p className="text-[11px] text-gray-400 m-0">Account Status</p><p className="text-[13px] mt-0.5 font-medium text-[#d93939]">Restricted</p></div>
                  <div><p className="text-[11px] text-gray-400 m-0">Interest Rate</p><p className="text-[13px] mt-0.5 font-medium">0.01% APY</p></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Recent Transactions */}
        <div className="bg-white border border-gray-300 rounded mb-5">
          <div className="border-b-2 border-[#426FB6] p-3 px-5">
            <h3 className="text-base font-bold m-0 text-black">Most Recent Transactions ({transactions.length})</h3>
          </div>
          <div className="p-3 px-5">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm m-0">No transactions yet.</p>
            ) : (
              transactions.slice(0, 5).map((t: any) => (
                <div key={t._id} className="py-3 border-b border-[#eee]">
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] text-gray-700 m-0">{new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })} {new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-base font-bold text-black m-0">
                      {t.type === "credit" ? "+" : "-"}{sym(t.currency)}{t.amount.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-1 m-0">
                    {t.type === "credit" ? "CREDIT" : "FUND TRANSFER"} @ {t.description || "N/A"}
                  </p>
                  <button onClick={() => setExpandedTx(expandedTx === t._id ? null : t._id)} className="bg-transparent border-none text-[#426FB6] cursor-pointer text-xs p-0 mt-1">{expandedTx === t._id ? "Hide details" : "Tap for more details"}</button>
                  {expandedTx === t._id && (
                    <div className="mt-2 p-2.5 bg-[#f9f9f9] rounded border border-[#eee]">
                      <p className="text-xs text-gray-700 m-0 mb-1">Transaction ID: {t._id}</p>
                      <p className="text-xs text-gray-700 m-0 mb-1">Type: {t.type === "credit" ? "Credit (Deposit)" : "Debit (Transfer)"}</p>
                      <p className="text-xs text-gray-700 m-0 mb-1">Amount: {sym(t.currency)}{t.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-700 m-0 mb-1">Date: {new Date(t.createdAt).toLocaleString()}</p>
                      {t.description && <p className="text-xs text-gray-700 m-0">Note: {t.description}</p>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Investment Accounts */}
        <div className="bg-white border border-gray-300 rounded mb-5">
          <div className="border-b-2 border-[#426FB6] p-3 px-5">
            <h3 className="text-base font-bold m-0 text-black">Investment accounts</h3>
          </div>
          <div className="p-4 px-5">
            <p className="text-sm text-gray-700 m-0 mb-2">SpringWell Bank Core checking - 9080</p>
            <button onClick={() => setQuickView(quickView === "alert" ? null : "alert")} className="bg-transparent border-none text-[#426FB6] cursor-pointer text-sm p-0">{quickView === "alert" ? "Hide" : "Quick view"}</button>
            {quickView === "alert" && (
              <div className="mt-3 p-3 bg-white rounded border border-[#eee]">
                <p className="text-[13px] text-gray-700 m-0 mb-1.5"><strong>Alert Details:</strong> Your account access was temporarily restricted after login attempts from an unrecognized location. To restore access, please visit a branch with valid ID or call our support line.</p>
                <p className="text-xs text-gray-500 m-0">Reference: SEC-2026-0903 | Reported: {new Date().toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bank Cards */}
        <div className="bg-white border border-gray-300 rounded mb-5">
          <div className="border-b-2 border-[#426FB6] p-3 px-5">
            <h3 className="text-base font-bold m-0 text-black">Bank Cards</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-700 m-0 mb-4">SpringWell Bank Card - 9040</p>
            <div className="w-full max-w-[380px] h-[240px] rounded-2xl bg-gradient-to-br from-[#1a3a5c] via-[#2a5a8c] to-[#1a3a5c] p-6 flex flex-col justify-between relative overflow-hidden text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="absolute inset-0 opacity-15 bg-cover bg-center" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500'%3E%3Cpath fill='%23ffffff' d='M150,100 Q200,80 250,100 T350,100 Q400,80 450,100 T550,100 Q600,80 650,100 T750,100 Q800,80 850,100 T950,100 V400 Q900,420 850,400 T750,400 Q700,420 650,400 T550,400 Q500,420 450,400 T350,400 Q300,420 250,400 T150,400 Z'/%3E%3C/svg%3E\")" }} />
              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-[30px] bg-white/30 rounded flex items-center justify-center">
                  <div className="w-5 h-3.5 border border-white/50 rounded-sm" />
                </div>
                <span className="text-xl font-bold italic text-[#FEDF01]">VISA</span>
              </div>
              <div className="relative z-10">
                <p className="text-xl tracking-widest font-semibold m-0 mb-4 font-mono">{cardNumber}</p>
                <div className="flex justify-between">
                  <div>
                    <p className="text-[10px] tracking-wide m-0 mb-0.5 opacity-80">CARD HOLDER</p>
                    <p className="text-sm font-bold m-0 tracking-wide">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] tracking-wide m-0 mb-0.5 opacity-80">EXPIRES</p>
                    <p className="text-sm font-bold m-0">10/2028</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Center */}
        <div className="bg-white/90 border border-gray-300 rounded mb-5 p-4 px-5 pb-5">
          <h3 className="text-base font-bold m-0 mb-4 text-gray-700">Activity Center</h3>
          <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-3">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => openModal(item.modal)}
                  className="flex flex-col items-center justify-center gap-2 p-5 px-2 border border-[#eee] rounded bg-white cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                >
                  <Icon className="w-8 h-8 text-[#426FB6]" />
                  <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <DashboardFooter lastLogin={user.lastLogin} />
      </div>

      <DashboardFullFooter />

      {/* Transfer Modal */}
      <Modal open={activeModal === "transfer"} onClose={() => setActiveModal(null)} title="Transfer Funds" maxWidth={420}>
        <form onSubmit={handleTransfer}>
          {transferError && <p className="text-[13px] bg-[rgba(217,57,57,0.1)] p-2 rounded mb-3 text-[#d93939]">{transferError}</p>}
          {transferSuccess && <p className="text-[13px] bg-[rgba(66,111,182,0.1)] p-2 rounded mb-3 text-[#426FB6]">{transferSuccess}</p>}
          <div className="mb-3">
            <Label className="text-xs text-gray-500 block mb-1">Recipient email</Label>
            <Input type="email" required placeholder="friend@springwellbk.com" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={transferForm.toEmail} onChange={(e) => setTransferForm({ ...transferForm, toEmail: e.target.value })} />
          </div>
          <div className="mb-3">
            <Label className="text-xs text-gray-500 block mb-1">Amount ({user.currency})</Label>
            <Input type="number" required min="0.01" step="0.01" placeholder="0.00" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
          </div>
          <div className="mb-3">
            <Label className="text-xs text-gray-500 block mb-1">Note (optional)</Label>
            <Input placeholder="Dinner, rent, etc." className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} />
          </div>
          <p className="text-xs text-gray-500 m-0 mb-3">Available: {sym(user.currency)}{user.balance.toLocaleString()}</p>
          <Button type="submit" className="w-full py-3 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer" disabled={transferBusy}>
            {transferBusy ? "Sending..." : "Send Transfer"}
          </Button>
        </form>
      </Modal>

      {/* Profile Modal */}
      <Modal open={activeModal === "profile"} onClose={() => setActiveModal(null)} title="Profile" maxWidth={500}>
        {profileMsg && <p className={`text-[13px] mb-3 ${profileMsg.includes("success") ? "text-[#426FB6]" : "text-[#d93939]"}`}>{profileMsg}</p>}
        <div className="flex justify-center mb-5">
          <ProfileImageUpload
            userId={userId}
            imageId={user.imageId}
            firstName={user.firstName}
            lastName={user.lastName}
            onImageSaved={() => { window.location.reload(); }}
            generateUploadUrl={generateUploadUrl}
            saveImage={saveProfileImage}
            removeImage={removeProfileImage}
            size="md"
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-4">
          {[
            { label: "First Name", key: "firstName" },
            { label: "Last Name", key: "lastName" },
            { label: "Phone", key: "phone" },
            { label: "Address", key: "address" },
          ].map((field) => (
            <div key={field.key}>
              <Label className="text-xs text-gray-500 block mb-1">{field.label}</Label>
              <Input className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={profileFields[field.key] || ""} onChange={(e) => setProfileFields({ ...profileFields, [field.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="border-t border-[#eee] pt-4 mb-4">
          <h4 className="m-0 mb-3 text-sm font-bold">Security</h4>
          {pwMsg && <p className={`text-[13px] mb-3 ${pwMsg.includes("success") ? "text-[#426FB6]" : "text-[#d93939]"}`}>{pwMsg}</p>}
          <form onSubmit={handlePasswordChange} className="grid gap-2.5">
            <Input type="password" placeholder="Current Password" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <Input type="password" placeholder="New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
            <Input type="password" placeholder="Confirm New Password" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
            <Button type="submit" className="py-2.5 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer">Update Password</Button>
          </form>
        </div>
        <Button onClick={handleProfileSave} className="w-full py-3 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer">Save Profile</Button>
      </Modal>

      {/* Alerts Modal */}
      <Modal open={activeModal === "alerts"} onClose={() => setActiveModal(null)} title="Alerts">
        <div className="p-6 text-center text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No new alerts</p>
          <p className="text-xs text-gray-300 mt-1 m-0">You&apos;re all caught up!</p>
        </div>
      </Modal>

      {/* Bill Pay Modal */}
      <Modal open={activeModal === "billPay"} onClose={() => setActiveModal(null)} title="Bill Pay">
        <div className="mb-3">
          <Label className="text-xs text-gray-500 block mb-1">Payee Name</Label>
          <Input placeholder="e.g. Electric Company" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <div className="mb-3">
          <Label className="text-xs text-gray-500 block mb-1">Account Number</Label>
          <Input placeholder="Account number" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <div className="mb-3">
          <Label className="text-xs text-gray-500 block mb-1">Amount</Label>
          <Input type="number" min="0.01" step="0.01" placeholder="0.00" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <div className="mb-4">
          <Label className="text-xs text-gray-500 block mb-1">Memo (optional)</Label>
          <Input placeholder="Invoice or reference" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <Button className="w-full py-3 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer" onClick={() => setActiveModal(null)}>Submit Payment</Button>
      </Modal>

      {/* Transaction History Modal */}
      <Modal open={activeModal === "transactions"} onClose={() => setActiveModal(null)} title="Transaction History" maxWidth={560}>
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx: any) => (
              <div key={tx._id} className="flex justify-between items-center p-3 px-4 bg-[#f9f9f9] rounded-md border border-[#eee]">
                <div>
                  <p className="m-0 text-sm font-medium text-gray-700">{tx.description || tx.type}</p>
                  <p className="mt-0.5 m-0 text-[11px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${tx.type === "credit" ? "text-[#16a34a]" : "text-[#d93939]"}`}>
                  {tx.type === "credit" ? "+" : "-"}{sym(user.currency)}{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Special Offers Modal */}
      <Modal open={activeModal === "offers"} onClose={() => setActiveModal(null)} title="Special Offers" maxWidth={520}>
        <div className="flex flex-col gap-3">
          {[
            { title: "5% Cash Back on Dining", desc: "Use your SpringWell card at restaurants this month and earn 5% cash back.", badge: "Limited Time" },
            { title: "0% APR for 12 Months", desc: "Open a new credit card and enjoy 0% intro APR for the first 12 months.", badge: "New" },
            { title: "Refer a Friend, Get $50", desc: "Invite friends to SpringWell and you both earn $50 when they open an account.", badge: "Ongoing" },
          ].map((offer, i) => (
            <div key={i} className="p-4 border border-[#eee] rounded-lg bg-[#fafafa]">
              <div className="flex justify-between items-center mb-1.5">
                <h4 className="m-0 text-sm font-bold text-gray-700">{offer.title}</h4>
                <span className="text-[10px] bg-[#FEDF01] text-black px-2 py-0.5 rounded-full font-semibold">{offer.badge}</span>
              </div>
              <p className="m-0 text-[13px] text-gray-500 leading-relaxed">{offer.desc}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* Messages Modal */}
      <Modal open={activeModal === "messages"} onClose={() => setActiveModal(null)} title="Messages" maxWidth={520}>
        <div className="mb-4">
          <Label className="text-xs text-gray-500 block mb-1">To</Label>
          <Input placeholder="Support team" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <div className="mb-4">
          <Label className="text-xs text-gray-500 block mb-1">Subject</Label>
          <Input placeholder="How can we help?" className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm" />
        </div>
        <div className="mb-4">
          <Label className="text-xs text-gray-500 block mb-1">Message</Label>
          <textarea placeholder="Type your message..." rows={4} className="w-full p-2.5 px-3 border border-gray-300 rounded text-sm font-[inherit] resize-y" />
        </div>
        <Button className="w-full py-3 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer" onClick={() => setActiveModal(null)}>Send Message</Button>
      </Modal>

      {/* Spending Modal */}
      <Modal open={activeModal === "spending"} onClose={() => setActiveModal(null)} title="Spending & Budgeting" maxWidth={520}>
        <div className="text-center mb-5">
          <p className="text-[13px] text-gray-500 m-0 mb-1">Current Balance</p>
          <p className="text-[28px] font-bold m-0 text-gray-700">{sym(user.currency)}{user.balance.toLocaleString()}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { cat: "Housing", spent: 0, budget: 1500, color: "#426FB6" },
            { cat: "Food & Dining", spent: 0, budget: 600, color: "#16a34a" },
            { cat: "Transportation", spent: 0, budget: 300, color: "#f59e0b" },
            { cat: "Entertainment", spent: 0, budget: 200, color: "#d93939" },
            { cat: "Utilities", spent: 0, budget: 250, color: "#8b5cf6" },
          ].map((b) => (
            <div key={b.cat}>
              <div className="flex justify-between mb-1">
                <span className="text-[13px] font-medium text-gray-700">{b.cat}</span>
                <span className="text-xs text-gray-400">{sym(user.currency)}{b.spent} / {sym(user.currency)}{b.budget}</span>
              </div>
              <div className="h-2 bg-[#eee] rounded overflow-hidden">
                <div className="h-full rounded transition-[width] duration-300" style={{ width: `${(b.spent / b.budget) * 100}%`, backgroundColor: b.color }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-300 text-center mt-4">No spending data yet. Start transacting to see your budget breakdown.</p>
      </Modal>

      {/* Goals Modal */}
      <Modal open={activeModal === "goals"} onClose={() => setActiveModal(null)} title="Savings Goals">
        <div className="p-6 text-center text-gray-400">
          <Target className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm mb-2">No goals set yet</p>
          <p className="text-xs text-gray-300 m-0 mb-4">Create a savings goal to track your progress.</p>
          <Button className="py-2.5 px-6 bg-[#426FB6] text-white border-none rounded text-[13px] font-semibold cursor-pointer" onClick={() => setActiveModal(null)}>Create Goal</Button>
        </div>
      </Modal>

      {/* Open Account Modal */}
      <Modal open={activeModal === "openAccount"} onClose={() => setActiveModal(null)} title="Open a New Account">
        <div className="flex flex-col gap-3">
          {[
            { name: "Checking Account", desc: "Everyday banking with no monthly fees", icon: "\uD83C\uDFE6" },
            { name: "Savings Account", desc: "Earn interest on your savings", icon: "\uD83D\uDCB0" },
            { name: "Money Market", desc: "Higher rates for higher balances", icon: "\uD83D\uDCC8" },
            { name: "Certificate of Deposit", desc: "Locked-in rates for fixed terms", icon: "\uD83D\uDD12" },
          ].map((acct) => (
            <div key={acct.name} className="flex items-center gap-3 p-3.5 border border-[#eee] rounded-lg cursor-pointer hover:bg-[#f5f5f5] transition-colors" onClick={() => setActiveModal(null)}>
              <span className="text-2xl">{acct.icon}</span>
              <div>
                <p className="m-0 text-sm font-semibold text-gray-700">{acct.name}</p>
                <p className="mt-0.5 m-0 text-xs text-gray-400">{acct.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
