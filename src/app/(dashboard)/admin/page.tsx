"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, Search, LogOut, Users, ArrowUpDown, CheckCircle, XCircle, MessageSquare, FileText, Wallet, Send, Pencil, Trash2, ShieldCheck, UserCog, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose, SheetTrigger } from "@/components/ui/sheet";

type Modal = null | "credit" | "transfer" | "edit" | "status";

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
  const loans = useQuery(api.admin.listLoans);
  const messages = useQuery(api.admin.listMessages);

  const creditDebit = useMutation(api.admin.creditDebit);
  const transfer = useMutation(api.admin.transfer);
  const setUserStatus = useMutation(api.admin.setUserStatus);
  const setUserRole = useMutation(api.admin.setUserRole);
  const updateUser = useMutation(api.admin.updateUser);
  const deleteUser = useMutation(api.admin.deleteUser);
  const approveLoan = useMutation(api.admin.approveLoan);
  const rejectLoan = useMutation(api.admin.rejectLoan);
  const setMessageStatus = useMutation(api.admin.setMessageStatus);

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

  if (!userId || users === undefined || transactions === undefined || loans === undefined || messages === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading...</p></div>;
  }

  const customers = users.filter((u: any) =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const nonAdmins = users.filter((u: any) => u.role !== "admin");
  const totalBalance = nonAdmins.reduce((s: number, u: any) => s + (u.balance ?? 0), 0);
  const pendingLoans = loans.filter((l: any) => l.status === "pending").length;
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
      flash(`${creditType === "credit" ? "Credit" : "Debit"} completed`);
      setModal(null);
    } catch (err: any) { flash(err?.message ?? "Transaction failed"); }
  }

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !fromUser || !toUser || !transferAmount) return;
    try {
      await transfer({ adminUserId: userId as any, fromUserId: fromUser as any, toUserId: toUser as any, amount: Number(transferAmount), description: transferDesc || "Admin transfer", date: transferDate || undefined });
      flash("Transfer completed");
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
  async function handleApprove(id: string) {
    if (!userId) return;
    await approveLoan({ adminUserId: userId as any, applicationId: id as any });
    flash("Loan approved and funds credited");
  }
  async function handleReject(id: string) {
    if (!userId) return;
    await rejectLoan({ adminUserId: userId as any, applicationId: id as any });
    flash("Loan rejected");
  }
  async function handleMessage(id: string, status: "read" | "replied") {
    if (!userId) return;
    await setMessageStatus({ adminUserId: userId as any, messageId: id as any, status });
    flash(`Message marked ${status}`);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Landmark className="h-5 w-5" />
            <span className="hidden sm:inline">SpringWell Bank</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-200" />
            <Input placeholder="Search customers..." className="pl-10 w-56 bg-green-800 border-green-700 text-white placeholder:text-green-300" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <span className="hidden sm:inline text-xs sm:text-sm text-green-200">Admin</span>
          <Button variant="ghost" size="sm" className="hidden md:inline-flex text-white hover:text-green-200 hover:bg-green-800" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-800" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto bg-green-900 text-white border-green-700 p-0">
              <SheetHeader className="px-5 h-14 border-b border-green-700 flex-row items-center justify-start gap-2 space-y-0">
                <Landmark className="h-5 w-5" />
                <SheetTitle className="text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-3 gap-1">
                <SheetClose asChild>
                  <button onClick={() => document.getElementById("accounts")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-800 text-sm font-medium text-left"><Users className="h-4 w-4" /> Accounts</button>
                </SheetClose>
                <SheetClose asChild>
                  <button onClick={() => document.getElementById("loans")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-800 text-sm font-medium text-left"><FileText className="h-4 w-4" /> Loan Applications</button>
                </SheetClose>
                <SheetClose asChild>
                  <button onClick={() => document.getElementById("messages")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-800 text-sm font-medium text-left"><MessageSquare className="h-4 w-4" /> Messages</button>
                </SheetClose>
                <SheetClose asChild>
                  <button onClick={() => document.getElementById("txns")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-green-800 text-sm font-medium text-left"><Wallet className="h-4 w-4" /> Recent Transactions</button>
                </SheetClose>
              </nav>
              <div className="mt-auto p-3 border-t border-green-700">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full text-white border-green-700 hover:bg-green-800" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {actionMsg && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">{actionMsg}</div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={<Users className="h-4 w-4" />} label="Customers" value={String(nonAdmins.length)} />
          <Stat icon={<Wallet className="h-4 w-4" />} label="Total Balance" value={`USD ${totalBalance.toLocaleString()}`} />
          <Stat icon={<FileText className="h-4 w-4" />} label="Pending Loans" value={String(pendingLoans)} />
          <Stat icon={<MessageSquare className="h-4 w-4" />} label="Unread Msgs" value={String(unreadMsgs)} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button size="sm" className="bg-green-700 hover:bg-green-800 sm:w-auto w-full" onClick={() => openCredit(null)}><ArrowUpDown className="h-4 w-4 mr-1" />Credit/Debit</Button>
          <Button size="sm" className="bg-green-700 hover:bg-green-800 sm:w-auto w-full" onClick={() => openTransfer(null)}><Send className="h-4 w-4 mr-1" />Fund Transfer</Button>
          <Button size="sm" className="bg-green-700 hover:bg-green-800 sm:w-auto w-full" onClick={openStatus}><CheckCircle className="h-4 w-4 mr-1" />Activate</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 sm:w-auto w-full" onClick={openStatus}><XCircle className="h-4 w-4 mr-1" />Suspend</Button>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 id="accounts" className="text-lg font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4" /> All Accounts ({customers.length})</h2>

            <div className="lg:hidden space-y-3">
              <div className="md:hidden relative mb-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search customers..." className="pl-10 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {customers.map((c: any) => (
                <div key={c._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{initials(c)}</div>
                      <div>
                        <p className="font-semibold text-sm">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                      </div>
                    </div>
                    <Badge variant={c.status === "active" ? "default" : c.status === "suspended" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{c.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-mono">{acct(c)}</span>
                    <span className="capitalize">{c.accountType}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                    <div>Credit Bal.<div className="font-semibold text-gray-700">{c.currency} {(c.creditBalance ?? 0).toLocaleString()}</div></div>
                    <div>Last Login<div className="font-semibold text-gray-700">{c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : "—"}</div></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{c.currency} {c.balance.toLocaleString()}</span>
                    <div className="flex flex-wrap gap-1">
                      <IconBtn title="Credit/Debit" onClick={() => openCredit(c)}><ArrowUpDown className="h-3 w-3" /></IconBtn>
                      <IconBtn title="Transfer" onClick={() => openTransfer(c)}><Send className="h-3 w-3" /></IconBtn>
                      {c.status !== "active" && <IconBtn title="Activate" onClick={() => handleStatus(c._id, "active")}><CheckCircle className="h-3 w-3 text-green-600" /></IconBtn>}
                      {c.status !== "suspended" && <IconBtn title="Suspend" onClick={() => handleStatus(c._id, "suspended")}><XCircle className="h-3 w-3 text-red-600" /></IconBtn>}
                      <IconBtn title="Edit" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></IconBtn>
                      <IconBtn title={c.role === "admin" ? "Make Customer" : "Make Admin"} onClick={() => handleRole(c._id, c.role === "admin" ? "customer" : "admin")}>{c.role === "admin" ? <UserCog className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}</IconBtn>
                      <IconBtn title="Delete" onClick={() => handleDelete(c)}><Trash2 className="h-3 w-3 text-red-600" /></IconBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-800 text-white text-xs">
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-left">Username</th>
                    <th className="px-3 py-2 text-left">Full Name</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Balance</th>
                    <th className="px-3 py-2 text-left">Credit Bal.</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Joined</th>
                    <th className="px-3 py-2 text-left">Last Login</th>
                    <th className="px-3 py-2 text-left">Control</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{acct(c)}</td>
                      <td className="px-3 py-2 text-xs">{c.email}</td>
                      <td className="px-3 py-2 font-medium text-xs flex items-center gap-2"><div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-[10px] font-bold">{initials(c)}</div>{c.firstName} {c.lastName}</td>
                      <td className="px-3 py-2 text-xs capitalize">{c.accountType}</td>
                      <td className="px-3 py-2 font-semibold text-xs">{c.currency} {c.balance.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs">{c.currency} {(c.creditBalance ?? 0).toLocaleString()}</td>
                      <td className="px-3 py-2"><Badge variant={c.status === "active" ? "default" : c.status === "suspended" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{c.status}</Badge></td>
                      <td className="px-3 py-2 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{c.lastLogin ? new Date(c.lastLogin).toLocaleDateString() : "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <IconBtn title="Credit/Debit" onClick={() => openCredit(c)}><ArrowUpDown className="h-3 w-3" /></IconBtn>
                          <IconBtn title="Transfer" onClick={() => openTransfer(c)}><Send className="h-3 w-3" /></IconBtn>
                          {c.status !== "active" && <IconBtn title="Activate" onClick={() => handleStatus(c._id, "active")}><CheckCircle className="h-3 w-3 text-green-600" /></IconBtn>}
                          {c.status !== "suspended" && <IconBtn title="Suspend" onClick={() => handleStatus(c._id, "suspended")}><XCircle className="h-3 w-3 text-red-600" /></IconBtn>}
                          <IconBtn title="Edit" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></IconBtn>
                          <IconBtn title={c.role === "admin" ? "Make Customer" : "Make Admin"} onClick={() => handleRole(c._id, c.role === "admin" ? "customer" : "admin")}>{c.role === "admin" ? <UserCog className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}</IconBtn>
                          <IconBtn title="Delete" onClick={() => handleDelete(c)}><Trash2 className="h-3 w-3 text-red-600" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 id="loans" className="text-lg font-bold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Loan Applications ({loans.length})</h2>

            <div className="lg:hidden space-y-3">
              {loans.map((l: any) => (
                <div key={l._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{l.fullName}</p>
                      <p className="text-xs text-gray-500">{l.email}</p>
                    </div>
                    <Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{l.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{new Date(l.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold">USD {l.amount.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">{l.purpose}</p>
                  {l.status === "pending" && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleApprove(l._id)}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600" onClick={() => handleReject(l._id)}>Reject</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-800 text-white text-xs">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Applicant</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                    <th className="px-3 py-2 text-left">Purpose</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((l: any) => (
                    <tr key={l._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-medium text-xs">{l.fullName}<div className="text-gray-400">{l.email}</div></td>
                      <td className="px-3 py-2 font-semibold text-xs">USD {l.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs">{l.purpose}</td>
                      <td className="px-3 py-2"><Badge variant={l.status === "approved" ? "default" : l.status === "rejected" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">{l.status}</Badge></td>
                      <td className="px-3 py-2">
                        {l.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleApprove(l._id)}>Approve</Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600" onClick={() => handleReject(l._id)}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 id="messages" className="text-lg font-bold mb-3 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Messages ({messages.length})</h2>

            <div className="lg:hidden space-y-3">
              {messages.map((m: any) => (
                <div key={m._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                    <Badge variant={m.status === "unread" ? "destructive" : m.status === "replied" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{m.status}</Badge>
                  </div>
                  <p className="text-sm font-medium">{m.subject ?? "N/A"}</p>
                  <p className="text-xs text-gray-600">{m.message}</p>
                  <p className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 pt-1">
                    {m.status === "unread" && <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleMessage(m._id, "read")}>Mark read</Button>}
                    {m.status !== "replied" && <Button size="sm" variant="outline" className="h-8 text-xs text-green-700" onClick={() => handleMessage(m._id, "replied")}>Reply</Button>}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-800 text-white text-xs">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">From</th>
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-left">Message</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m: any) => (
                    <tr key={m._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-medium text-xs">{m.name}<div className="text-gray-400">{m.email}</div></td>
                      <td className="px-3 py-2 text-xs">{m.subject ?? "N/A"}</td>
                      <td className="px-3 py-2 text-xs max-w-[220px] truncate">{m.message}</td>
                      <td className="px-3 py-2"><Badge variant={m.status === "unread" ? "destructive" : m.status === "replied" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{m.status}</Badge></td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {m.status === "unread" && <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleMessage(m._id, "read")}>Mark read</Button>}
                          {m.status !== "replied" && <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-700" onClick={() => handleMessage(m._id, "replied")}>Reply</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 id="txns" className="text-lg font-bold mb-3 flex items-center gap-2"><ArrowUpDown className="h-4 w-4" /> Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions yet.</p>
            ) : (
              <>
                <div className="md:hidden space-y-3">
                  {transactions.map((t: any) => (
                    <div key={t._id} className="border rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          {t.backDate && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Backdated</Badge>}
                          <Badge variant={t.status === "successful" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{t.description || "N/A"}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-gray-500">{t.type}</span>
                        <span className="font-bold">{t.currency} {t.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-800 text-white text-xs">
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
                          <td className="px-3 py-2 text-xs capitalize">{t.type}</td>
                          <td className="px-3 py-2 text-xs">{t.description || "N/A"}</td>
                          <td className="px-3 py-2 font-semibold text-xs">{t.currency} {t.amount.toLocaleString()}</td>
                          <td className="px-3 py-2 flex items-center gap-1">
                            {t.backDate && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Backdated</Badge>}
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
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/40 z-30 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {modal === "credit" && (
              <form onSubmit={handleCredit} className="p-5 space-y-3">
                <h3 className="font-bold text-lg">Credit / Debit Account</h3>
                <p className="text-sm text-gray-500">{activeUser ? `${activeUser.firstName} ${activeUser.lastName} (${activeUser.email})` : "Select a customer"}</p>
                <select className="border rounded px-3 py-2 text-sm w-full" value={activeUser?._id ?? ""} onChange={(e) => { const u = users.find((x: any) => x._id === e.target.value); setActiveUser(u); }}>
                  <option value="">Select user</option>
                  {nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                </select>
                <select className="border rounded px-3 py-2 text-sm w-full" value={creditType} onChange={(e) => setCreditType(e.target.value as "credit" | "debit")}>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                <Input type="number" placeholder="Amount" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} required />
                <Input placeholder="Description" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Transaction date (backdate supported)</label>
                  <Input type="date" value={creditDate} onChange={(e) => setCreditDate(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button type="submit" className="bg-green-700 hover:bg-green-800">Submit</Button>
                </div>
              </form>
            )}
            {modal === "transfer" && (
              <form onSubmit={handleTransfer} className="p-5 space-y-3">
                <h3 className="font-bold text-lg">Fund Transfer</h3>
                <select className="border rounded px-3 py-2 text-sm w-full" value={fromUser} onChange={(e) => setFromUser(e.target.value)} required>
                  <option value="">From account</option>
                  {users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName} {u.lastName}</option>)}
                </select>
                <select className="border rounded px-3 py-2 text-sm w-full" value={toUser} onChange={(e) => setToUser(e.target.value)} required>
                  <option value="">To account</option>
                  {users.map((u: any) => <option key={u._id} value={u._id}>{acct(u)} · {u.firstName} {u.lastName}</option>)}
                </select>
                <Input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} required />
                <Input placeholder="Description" value={transferDesc} onChange={(e) => setTransferDesc(e.target.value)} />
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Transaction date (backdate supported)</label>
                  <Input type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button type="submit" className="bg-green-700 hover:bg-green-800">Transfer</Button>
                </div>
              </form>
            )}
            {modal === "edit" && (
              <form onSubmit={handleEdit} className="p-5 space-y-3">
                <h3 className="font-bold text-lg">Edit Account</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="First name" value={edit.firstName} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} />
                  <Input placeholder="Last name" value={edit.lastName} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} />
                </div>
                <Input placeholder="Email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="border rounded px-3 py-2 text-sm" value={edit.accountType} onChange={(e) => setEdit({ ...edit, accountType: e.target.value })}>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="business">Business</option>
                  </select>
                  <select className="border rounded px-3 py-2 text-sm" value={edit.currency} onChange={(e) => setEdit({ ...edit, currency: e.target.value })}>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select className="border rounded px-3 py-2 text-sm" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="pending">pending</option>
                  </select>
                  <Input type="number" placeholder="Balance" value={edit.balance} onChange={(e) => setEdit({ ...edit, balance: e.target.value })} />
                </div>
                <Input type="number" placeholder="Credit Balance" value={edit.creditBalance} onChange={(e) => setEdit({ ...edit, creditBalance: e.target.value })} />
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button type="submit" className="bg-green-700 hover:bg-green-800">Save</Button>
                </div>
              </form>
            )}
            {modal === "status" && (
              <form className="p-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
                <h3 className="font-bold text-lg">Change Account Status</h3>
                <p className="text-sm text-gray-500">Select an account to activate or suspend.</p>
                <select className="border rounded px-3 py-2 text-sm w-full" value={statusTarget} onChange={(e) => setStatusTarget(e.target.value)} required>
                  <option value="">Select account</option>
                  {nonAdmins.map((u: any) => <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>)}
                </select>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
                  <Button type="button" className="bg-green-700 hover:bg-green-800" disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "active"); setModal(null); } }}>Activate</Button>
                  <Button type="button" className="bg-red-600 hover:bg-red-700" disabled={!statusTarget} onClick={() => { if (statusTarget) { handleStatus(statusTarget, "suspended"); setModal(null); } }}>Suspend</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-sm">{value}</p>
      </div>
    </div>
  );
}

function IconBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button size="sm" variant="outline" title={title} className="h-7 w-7 p-0" onClick={onClick}>{children}</Button>
  );
}
