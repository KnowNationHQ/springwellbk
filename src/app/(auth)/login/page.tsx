"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { User, Lock, Mail, Shield, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useMutation(api.auth.login);
  const requestLoginCode = useMutation(api.auth.requestLoginCode);
  const verifyLoginCode = useMutation(api.auth.verifyLoginCode);

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative" style={{ backgroundImage: "url(/images/about.jpeg)", backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex">
            <Image src="/logo-white.svg" alt="SpringWell Bank" width={140} height={28} priority className="h-7 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-7 pb-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#426FB6]/10 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#426FB6]" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 m-0">Welcome Back</h1>
            <p className="text-sm text-gray-500 m-0 mt-1">
              {mode === "password"
                ? "Sign in to your account"
                : otpStep === "request"
                  ? "We'll email you a one-time code"
                  : "Enter the code sent to your email"}
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">{error}</div>
            )}

            {mode === "password" ? (
              <form onSubmit={handlePassword} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Username</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426FB6]/30 focus:border-[#426FB6] transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426FB6]/30 focus:border-[#426FB6] transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs font-medium text-[#426FB6] hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#426FB6] hover:bg-[#3560a0] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
                </button>

                {/* OTP toggle */}
                <button
                  type="button"
                  onClick={() => { setError(""); setOtpStep("request"); setMode("otp"); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#426FB6] hover:underline font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email me a login code instead
                </button>
              </form>
            ) : otpStep === "request" ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Username</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426FB6]/30 focus:border-[#426FB6] transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#426FB6] hover:bg-[#3560a0] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send code"}
                </button>
                <button
                  type="button"
                  onClick={() => { setError(""); setMode("password"); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#426FB6] hover:underline font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to password login
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Login code</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input
                      id="code"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#426FB6]/30 focus:border-[#426FB6] transition-all tracking-widest text-center font-mono"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#426FB6] hover:bg-[#3560a0] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify & sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => { setError(""); setCode(""); setUsername(""); setOtpStep("request"); }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#426FB6] hover:underline font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Use a different username
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 m-0">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-[#426FB6] hover:underline font-semibold">
                  Open Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
