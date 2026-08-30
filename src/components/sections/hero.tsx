"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const login = useMutation(api.auth.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ email, password });
      localStorage.setItem("userId", result.userId);
      router.push(result.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <p className="text-green-300 text-sm font-medium mb-3">Your Trusted Banking Partner</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Banking Made<br />
              <span className="text-green-400">Simple & Secure</span>
            </h1>
            <p className="text-green-200 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">
              Open a free account in minutes. Manage your money, send payments, and track your finances — all from one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-white text-green-800 hover:bg-green-100">
                <Link href="/register">Open Free Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-green-400 text-green-300 hover:bg-green-700">
                <Link href="/loan">Apply for Loan</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start text-xs text-green-300">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> FDIC Insured</span>
              <span>256-bit Encryption</span>
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <Card className="bg-white/10 backdrop-blur border-green-600 shadow-xl">
              <CardContent className="p-5 sm:p-6">
                <h3 className="text-lg font-bold mb-1">Online Banking</h3>
                <p className="text-green-200 text-xs mb-4">Sign in to access your account</p>
                {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label className="text-green-200 text-xs">Email</Label>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/20 border-green-500 text-white placeholder:text-green-300/60 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-green-200 text-xs">Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white/20 border-green-500 text-white placeholder:text-green-300/60 h-10"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-white text-green-800 hover:bg-green-100 h-10" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-green-300 text-xs hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
