"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, LogOut, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, User, FileText, Settings, Menu, Link2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "loans" | "profile">("transactions");
  const [editing, setEditing] = useState(false);
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ toEmail: "", amount: "", description: "" });
  const [transferError, setTransferError] = useState("");
  const [transferBusy, setTransferBusy] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const updateProfile = useMutation(api.auth.updateProfile);
  const changePassword = useMutation(api.auth.changePassword);
  const transfer = useMutation(api.auth.transfer);
  const linkBank = useMutation(api.plaid.linkBank);
  const syncUser = useAction(api.plaidSync.syncUser);
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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }

  const { user, transactions, loanApplications } = stats;

  const creditTotal = transactions.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + t.amount, 0);
  const debitTotal = transactions.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + t.amount, 0);
  const flowTotal = creditTotal + debitTotal || 1;
  const creditPct = Math.round((creditTotal / flowTotal) * 100);

  function handleProfileSave() {
    updateProfile({ userId: userId as any, ...profileFields });
    setEditing(false);
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setTransferError("");
    setTransferBusy(true);
    try {
      const amt = parseFloat(transferForm.amount);
      if (!transferForm.toEmail || isNaN(amt) || amt <= 0) throw new Error("Enter a valid recipient email and amount");
      await transfer({ fromUserId: userId as any, toEmail: transferForm.toEmail, amount: amt, description: transferForm.description || undefined });
      setTransferForm({ toEmail: "", amount: "", description: "" });
      setTransferOpen(false);
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

  const tabs = [
    { id: "transactions" as const, label: "Transactions", icon: Clock },
    { id: "loans" as const, label: "Loans", icon: CreditCard },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  const cardLast4 = (userId?.replace(/[^0-9]/g, "").slice(-4)) || "4242";

  const actions = [
    { label: "Transactions", icon: Clock, action: () => setActiveTab("transactions") },
    { label: "Transfer Funds", icon: ArrowUpRight, action: () => setTransferOpen(true) },
    { label: "Loans", icon: CreditCard, action: () => setActiveTab("loans") },
    { label: "Profile", icon: User, action: () => setActiveTab("profile") },
    { label: "Messages", icon: FileText, href: "mailto:support@springwellbk.com" },
    { label: "Linked Accounts", icon: Link2, action: () => document.getElementById("linked")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sheet>
        <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Landmark className="h-5 w-5" />
              <span className="hidden sm:inline">SpringWell Bank</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-green-200 hidden sm:inline">{user.firstName} {user.lastName}</span>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex text-white hover:text-green-200 hover:bg-green-700" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
            <SheetTrigger asChild>
              <button className="md:hidden p-2" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
          </div>
        </header>

        <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto bg-green-800 text-white border-green-700 p-0">
          <SheetHeader className="px-4 h-14 border-b border-green-700 justify-center">
            <SheetTitle className="text-white font-bold flex items-center gap-2"><Landmark className="h-5 w-5" /> Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-2 gap-1">
            <SheetClose asChild>
              <a href="/loan" className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-700 text-sm font-medium"><CreditCard className="h-4 w-4" /> Apply for Loan</a>
            </SheetClose>
            <SheetClose asChild>
              <button onClick={() => document.getElementById("linked")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-700 text-sm font-medium"><Link2 className="h-4 w-4" /> Linked Accounts</button>
            </SheetClose>
          </nav>
          <div className="mt-auto p-3 border-t border-green-700">
            <Button variant="outline" className="w-full text-white border-green-600 hover:bg-green-700" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="bg-green-700 px-4 py-6 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <p className="text-green-200 text-xs">Welcome back, {user.firstName}</p>
            <p className="text-green-200 text-xs hidden sm:block">Last sign in {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{user.currency} {user.balance.toLocaleString()}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <p className="text-green-200 text-xs">{user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} Account &middot; Signed in as {user.firstName} {user.lastName}</p>
            <span className="text-green-400 text-xs hidden sm:inline">•</span>
            <button onClick={() => setActiveTab("profile")} className="text-green-200 text-xs underline hover:text-white">Update profile</button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card id="linked" className="mb-6">
          <CardContent className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Linked Accounts</h2>
                <p className="text-xs text-gray-500">
                  {links && links.length > 0
                    ? links.map((l: any) => l.institution).join(", ") + " · synced every 30 min"
                    : "Connect a bank to stream live transactions"}
                </p>
              </div>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={connectBank} disabled={busy}>
              <Link2 className="h-4 w-4 mr-2" /> {busy ? "Connecting..." : links && links.length > 0 ? "Sync Now" : "Connect Bank (Plaid)"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-1 overflow-hidden p-0">
            <div className="rounded-2xl bg-gradient-to-br from-green-700 to-green-900 text-white p-5 h-full min-h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wide">SpringWell Bank</span>
                <CreditCard className="h-6 w-6 opacity-80" />
              </div>
              <div>
                <p className="font-mono text-lg tracking-[0.2em]">**** **** **** {cardLast4}</p>
                <div className="flex justify-between mt-4 text-xs">
                  <div>
                    <p className="opacity-70 uppercase">Card Holder</p>
                    <p className="font-semibold uppercase">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-70 uppercase">Expires</p>
                    <p className="font-semibold">10/28</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold">Personal Account</h2>
                  <span className="text-xs text-gray-400">Quick view</span>
                </div>
                <p className="text-2xl font-bold text-green-700">{user.currency} {user.balance.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Account Number &bull;••• {cardLast4}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <h2 className="text-sm font-bold mb-4">Activity Center</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {actions.map((a) => {
                    const inner = (
                      <div className="flex flex-col items-center justify-center gap-2 h-20 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 transition-colors text-center px-2">
                        <a.icon className="h-5 w-5 text-green-700" />
                        <span className="text-xs font-medium text-gray-700">{a.label}</span>
                      </div>
                    );
                    return a.href ? (
                      <a key={a.label} href={a.href} className="block">{inner}</a>
                    ) : (
                      <button key={a.label} onClick={a.action} className="block text-left w-full">{inner}</button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold">Spending Summary</h2>
                  <span className="text-xs text-gray-400">Last {transactions.length} txns</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Money In</p>
                    <p className="font-bold text-green-700">{user.currency} {creditTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Money Out</p>
                    <p className="font-bold text-red-600">{user.currency} {debitTotal.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-2.5 w-full rounded-full bg-red-100 overflow-hidden flex">
                  <div className="h-full bg-green-600" style={{ width: `${creditPct}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">{creditPct}% of recent flow was money in</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "transactions" | "loans" | "profile")} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-lg p-1 shadow-sm h-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=active]:shadow">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activeTab === "transactions" && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions yet.</p>
              ) : (
                <>
                  <div className="md:hidden space-y-3">
                    {transactions.map((t: any) => (
                      <div key={t._id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{t.description || "N/A"}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              {t.type === "credit" ? <ArrowDownLeft className="h-3 w-3 text-green-600" /> : <ArrowUpRight className="h-3 w-3 text-red-600" />}
                              <span className="capitalize">{t.type}</span>
                            </span>
                            <span className="px-1">•</span>
                            <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {t.source === "plaid" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Plaid</Badge>}
                            <Badge variant={t.status === "successful" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
                          </div>
                        </div>
                        <span className={`text-sm font-bold whitespace-nowrap ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "credit" ? "+" : "-"}{t.currency} {t.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-700 text-white text-xs">
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-left">Amount</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t: any) => (
                          <tr key={t._id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-1 text-xs">
                                {t.type === "credit" ? <ArrowDownLeft className="h-3 w-3 text-green-600" /> : <ArrowUpRight className="h-3 w-3 text-red-600" />}
                                {t.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs">{t.description || "N/A"}</td>
                            <td className="px-3 py-2 font-semibold text-xs">
                              <span className={t.type === "credit" ? "text-green-600" : "text-red-600"}>
                                {t.type === "credit" ? "+" : "-"}{t.currency} {t.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-3 py-2 flex items-center gap-1">
                              {t.source === "plaid" && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Plaid</Badge>}
                              <Badge variant={t.status === "successful" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "loans" && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Loan Applications</h2>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" asChild>
                  <Link href="/loan">Apply</Link>
                </Button>
              </div>
              {loanApplications.length === 0 ? (
                <p className="text-gray-500 text-sm">No loan applications yet.</p>
              ) : (
                <>
                  <div className="md:hidden space-y-3">
                    {loanApplications.map((l: any) => (
                      <div key={l._id} className="border rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">USD {l.amount.toLocaleString()}</span>
                          <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{l.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 capitalize">{l.purpose}</p>
                        <p className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-green-700 text-white text-xs">
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Amount</th>
                          <th className="px-3 py-2 text-left">Purpose</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loanApplications.map((l: any) => (
                          <tr key={l._id} className="border-b hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                            <td className="px-3 py-2 font-semibold text-xs">USD {l.amount.toLocaleString()}</td>
                            <td className="px-3 py-2 text-xs">{l.purpose}</td>
                            <td className="px-3 py-2">
                              <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{l.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "profile" && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Profile</h2>
                {!editing ? (
                  <Button size="sm" variant="outline" onClick={() => { setEditing(true); setProfileFields({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || "", address: user.address || "", city: user.city || "", state: user.state || "", zip: user.zip || "" }); }}>
                    <Settings className="h-4 w-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleProfileSave}>Save</Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Available Balance</p>
                  <p className="font-bold text-green-700">{user.currency} {user.balance.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Credit Balance</p>
                  <p className="font-bold text-green-700">{user.currency} {(user.creditBalance ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "First Name", key: "firstName" },
                  { label: "Last Name", key: "lastName" },
                  { label: "Email", key: "email", disabled: true },
                  { label: "Phone", key: "phone" },
                  { label: "Address", key: "address" },
                  { label: "City", key: "city" },
                  { label: "State", key: "state" },
                  { label: "Zip Code", key: "zip" },
                ].map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-gray-500">{field.label}</Label>
                    {editing && !field.disabled ? (
                      <Input
                        className="h-9 text-sm"
                        value={profileFields[field.key] || ""}
                        onChange={(e) => setProfileFields({ ...profileFields, [field.key]: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm py-2">{field.key === "email" ? user.email : user[field.key as keyof typeof user] || "\u2014"}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-base font-bold mb-3">Security</h3>
                {pwMsg && <p className={`text-sm mb-3 ${pwMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>{pwMsg}</p>}
                <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Current Password</Label>
                    <Input type="password" autoComplete="current-password" className="h-9 text-sm" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">New Password</Label>
                    <Input type="password" autoComplete="new-password" className="h-9 text-sm" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Confirm New</Label>
                    <div className="flex gap-2">
                      <Input type="password" autoComplete="new-password" className="h-9 text-sm" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
                      <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">Update</Button>
                    </div>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        )}

      </main>

      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setTransferOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-green-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold">Transfer Funds</h3>
              <button onClick={() => setTransferOpen(false)} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleTransfer} className="p-5 space-y-3">
              {transferError && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{transferError}</p>}
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Recipient email</Label>
                <Input type="email" required autoComplete="email" placeholder="friend@springwellbk.com" className="h-10" value={transferForm.toEmail} onChange={(e) => setTransferForm({ ...transferForm, toEmail: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Amount ({user.currency})</Label>
                <Input type="number" required min="0.01" step="0.01" placeholder="0.00" className="h-10" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-500">Note (optional)</Label>
                <Input className="h-10" placeholder="Dinner, rent, etc." value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} />
              </div>
              <p className="text-xs text-gray-500">Available: {user.currency} {user.balance.toLocaleString()}</p>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-10" disabled={transferBusy}>
                {transferBusy ? "Sending..." : "Send Transfer"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
