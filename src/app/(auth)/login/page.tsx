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

export default function LoginPage() {
  const router = useRouter();
  const login = useMutation(api.auth.login);
  const requestLoginCode = useMutation(api.auth.requestLoginCode);
  const verifyLoginCode = useMutation(api.auth.verifyLoginCode);

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpStep, setOtpStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function routeAfterLogin(result: { userId: string; role: string }) {
    localStorage.setItem("userId", result.userId);
    router.push(result.role === "admin" ? "/admin" : "/dashboard");
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ username, password });
      routeAfterLogin(result);
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestLoginCode({ username });
      setOtpStep("verify");
    } catch (err: any) {
      setError(err.message || "Could not send code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyLoginCode({ username, code });
      routeAfterLogin(result);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        backgroundImage: "url(/images/about.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.55)" }} />

      <div className="w-full max-w-md" style={{ position: "relative", zIndex: 1 }}>
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <img src="/logo.svg" alt="SpringWell Bank" style={{ height: 40 }} />
          </Link>
        </div>

        <Card className="shadow-2xl" style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" }}>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-center mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              {mode === "password"
                ? "Log in to your account"
                : otpStep === "request"
                  ? "We'll email you a one-time code"
                  : `Enter the code we sent to your email`}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
            )}

            {mode === "password" ? (
              <form onSubmit={handlePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-blue-700 hover:underline font-medium">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setError(""); setOtpStep("request"); setMode("otp"); }}
                  className="w-full text-center text-sm text-blue-700 hover:underline font-medium"
                >
                  Email me a login code instead
                </button>
              </form>
            ) : otpStep === "request" ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Sending..." : "Send code"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setError(""); setMode("password"); }}
                  className="w-full text-center text-sm text-blue-700 hover:underline font-medium"
                >
                  Back to password login
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Login code</Label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & sign in"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setError(""); setCode(""); setOtpStep("request"); }}
                  className="w-full text-center text-sm text-blue-700 hover:underline font-medium"
                >
                  Use a different username
                </button>
              </form>
            )}

            <p className="text-center text-sm text-gray-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-700 hover:underline font-semibold">
                Open Account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
