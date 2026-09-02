"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const createUser = useMutation(api.users.create);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [currency, setCurrency] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!accountType) { setError("Please select an account type"); return; }
    if (!currency) { setError("Please select a currency"); return; }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        accountType: accountType as "checking" | "savings" | "business",
        currency: currency as "USD" | "GBP" | "EUR",
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-blue-700">
            <Landmark className="h-7 w-7" />
            SpringWell Bank
          </Link>
          <p className="text-gray-500 mt-3 text-sm">Create your account in minutes</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-5 sm:p-7">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
                Account created! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">First Name *</Label>
                  <Input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Last Name *</Label>
                  <Input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-10" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Username *</Label>
                <Input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Email *</Label>
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Account Type *</Label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Currency *</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Password *</Label>
                <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-10" />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Confirm Password *</Label>
                <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10" />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={loading || success}>
                {loading ? "Creating Account..." : "Open Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-700 hover:underline font-semibold">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
