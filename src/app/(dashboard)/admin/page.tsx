"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, Search, LogOut, Users, ArrowUpDown, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) { router.push("/login"); return; }
    setUserId(id);
  }, [router]);

  const users = useQuery(api.users.list);
  const transactions = useQuery(api.transactions.recent, { limit: 20 });
  const updateUserStatus = useMutation(api.users.updateStatus);
  const createTransaction = useMutation(api.transactions.create);

  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");

  if (!userId || users === undefined || transactions === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>;
  }

  const customers = users.filter((u: any) =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleStatusUpdate(uid: string, status: "active" | "suspended" | "pending") {
    await updateUserStatus({ userId: uid as any, status });
    setActionMsg(`Account ${status === "suspended" ? "suspended" : "activated"}`);
    setTimeout(() => setActionMsg(""), 3000);
  }

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!creditUserId || !creditAmount) return;
    await createTransaction({
      userId: creditUserId as any,
      type: "credit",
      amount: Number(creditAmount),
      currency: "USD",
      description: creditDesc || "Admin credit",
    });
    setCreditUserId("");
    setCreditAmount("");
    setCreditDesc("");
    setActionMsg("Transaction completed");
    setTimeout(() => setActionMsg(""), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Landmark className="h-5 w-5" />
          <span className="hidden sm:inline">SpringWell Bank</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-green-200">Admin</span>
          <Button variant="ghost" size="sm" className="text-white hover:text-green-200 hover:bg-green-700" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </header>

      <div className="bg-green-700 px-4 py-2 flex flex-wrap gap-2">
        <Button size="sm" className="bg-green-600 hover:bg-green-800 text-xs" onClick={() => document.getElementById("credit-section")?.scrollIntoView({ behavior: "smooth" })}>Credit Account</Button>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-800 text-xs" onClick={() => document.getElementById("customers-section")?.scrollIntoView({ behavior: "smooth" })}>Customers</Button>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-800 text-xs" onClick={() => document.getElementById("transactions-section")?.scrollIntoView({ behavior: "smooth" })}>Transactions</Button>
      </div>

      {actionMsg && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">{actionMsg}</div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <Card id="credit-section">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-lg font-bold mb-3">Credit / Debit Account</h2>
            <form onSubmit={handleCredit} className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-3">
              <select className="border rounded px-3 py-2 text-sm w-full" value={creditUserId} onChange={(e) => setCreditUserId(e.target.value)} required>
                <option value="">Select user</option>
                {users.filter((u: any) => u.role !== "admin").map((u: any) => (
                  <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
              <Input type="number" placeholder="Amount" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} required className="w-full" />
              <Input placeholder="Description" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} className="w-full" />
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">Submit</Button>
            </form>
          </CardContent>
        </Card>

        <Card id="customers-section">
          <CardContent className="p-4 md:p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search customers..." className="pl-10 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" /> Customers ({customers.length})
            </h2>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-green-700 text-white text-xs">
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Balance</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c._id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs">{c.email}</td>
                      <td className="px-3 py-2 font-medium text-xs">{c.firstName} {c.lastName}</td>
                      <td className="px-3 py-2 font-semibold text-xs">{c.currency} {c.balance.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <Badge variant={c.status === "active" ? "default" : c.status === "suspended" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          {c.status !== "active" && (
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => handleStatusUpdate(c._id, "active")}><CheckCircle className="h-3 w-3" /></Button>
                          )}
                          {c.status !== "suspended" && (
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600" onClick={() => handleStatusUpdate(c._id, "suspended")}><XCircle className="h-3 w-3" /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card id="transactions-section">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" /> Recent Transactions
            </h2>
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm min-w-[500px]">
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
                        <td className="px-3 py-2 text-xs">{t.type}</td>
                        <td className="px-3 py-2 text-xs">{t.description || "N/A"}</td>
                        <td className="px-3 py-2 font-semibold text-xs">{t.currency} {t.amount.toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <Badge variant={t.status === "successful" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">{t.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
