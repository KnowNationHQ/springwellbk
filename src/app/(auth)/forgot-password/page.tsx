"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const requestReset = useMutation(api.auth.requestPasswordReset);
  const resetPassword = useMutation(api.auth.resetPassword);

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestReset({ email });
      setInfo(`If an account exists for ${email}, a reset code is on its way.`);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword: password });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <img src="/logo.svg" alt="SpringWell Bank" style={{ height: 40 }} />
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
            )}
            {info && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">{info}</div>
            )}

            {step === "email" ? (
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold">Reset Password</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter your email to receive a reset code</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Code"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-blue-700 hover:underline">Back to Login</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold">Choose a New Password</h2>
                  <p className="text-gray-500 text-sm mt-1">Enter the code we sent to {email}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Reset code</Label>
                  <Input id="code" inputMode="numeric" placeholder="6-digit code" required value={code} onChange={(e) => setCode(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" placeholder="At least 6 characters" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" placeholder="Re-enter password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setError(""); setInfo(""); setStep("email"); }}
                  className="w-full text-center text-sm text-blue-700 hover:underline font-medium"
                >
                  Use a different email
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
