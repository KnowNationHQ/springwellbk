"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  const router = useRouter();
  const login = useMutation(api.auth.login);
  const t = useT();
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
    <section className="relative bg-[#426FB6] overflow-hidden">
      <img src="/images/hero.jpeg" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#426FB6]/90 via-[#426FB6]/70 to-[#426FB6]/50" />
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <p className="text-gray-300 text-sm font-medium mb-3">{t("hero.eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-white">
              SpringWell Bank<br />
              <span className="text-[#FEDF01]">We Are Reliable</span>
            </h1>
            <p className="text-gray-200 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-[#FEDF01] text-gray-900 hover:bg-[#e6c900] font-semibold">
                <Link href="/register">{t("hero.cta1")}</Link>
              </Button>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">{t("hero.cardTitle")}</h3>
                {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label className="text-gray-700 text-xs">{t("hero.username")}</Label>
                    <Input
                      type="text"
                      placeholder="Enter email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-300 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-xs">{t("hero.password")}</Label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-300 h-10"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#426FB6] hover:bg-[#3560a0] text-white h-10" disabled={loading}>
                    {loading ? t("hero.signingIn") : t("hero.signIn")}
                  </Button>
                </form>
                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-[#426FB6] text-xs hover:underline">
                    {t("hero.forgot")}
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
