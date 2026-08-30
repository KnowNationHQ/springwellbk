"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark, LogOut, ArrowUpRight, ArrowDownLeft, Clock, CreditCard, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "loans" | "profile">("transactions");
  const [editing, setEditing] = useState(false);
  const [profileFields, setProfileFields] = useState<Record<string, string>>({});
  const updateProfile = useMutation(api.auth.updateProfile);

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

  function handleProfileSave() {
    updateProfile({ userId: userId as any, ...profileFields });
    setEditing(false);
  }

  const tabs = [
    { id: "transactions" as const, label: "Transactions", icon: Clock },
    { id: "loans" as const, label: "Loans", icon: CreditCard },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Landmark className="h-5 w-5" />
          <span className="hidden sm:inline">SpringWell Bank</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm text-green-200 hidden sm:inline">{user.firstName} {user.lastName}</span>
          <Button variant="ghost" size="sm" className="text-white hover:text-green-200 hover:bg-green-700" onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Logout</span>
          </Button>
        </div>
      </header>

      <div className="bg-green-700 px-4 py-6 text-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-200 text-xs mb-1">Welcome back, {user.firstName}</p>
          <h1 className="text-2xl sm:text-3xl font-bold">{user.currency} {user.balance.toLocaleString()}</h1>
          <p className="text-green-200 text-xs mt-1">{user.accountType.charAt(0).toUpperCase() + user.accountType.slice(1)} Account &middot; {user.email}</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id
                  ? "bg-green-700 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "transactions" && (
          <Card>
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
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
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-sm min-w-[400px]">
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
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
