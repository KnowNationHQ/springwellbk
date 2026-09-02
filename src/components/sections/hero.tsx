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
import { Shield } from "lucide-react";

export function HeroSection() {
  const router = useRouter();
  const login = useMutation(api.auth.login);
  const t = useT();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login({ username, password });
      localStorage.setItem("userId", result.userId);
      router.push(result.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative bg-blue-800 text-white overflow-hidden">
      <img src="/images/hero.jpeg" alt="" aria-hidden className="absolute inset-0 h-full w-full scale-105 object-cover opacity-100 blur-[3px]" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <p className="text-blue-200 text-sm font-medium mb-3 drop-shadow-lg">{t("hero.eyebrow")}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 drop-shadow-lg">
              {t("hero.title1")}<br />
              <span className="text-blue-300">{t("hero.title2")}</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0 drop-shadow-lg">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-white text-blue-800 hover:bg-blue-100">
                <Link href="/register">{t("hero.cta1")}</Link>
              </Button>
            </div>
            <div className="flex items-center gap-4 mt-6 justify-center lg:justify-start text-xs text-blue-300">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> {t("hero.badge1")}</span>
              <span>{t("hero.badge2")}</span>
              <span>{t("hero.badge3")}</span>
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <Card className="bg-white/10 backdrop-blur border-blue-600 shadow-xl">
              <CardContent className="p-5 sm:p-6">
                <h3 className="text-lg font-bold mb-1">{t("hero.cardTitle")}</h3>
                <p className="text-white/80 text-xs mb-4">{t("hero.cardSub")}</p>
                {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-3">
                  <div>
                    <Label className="text-white text-xs">{t("hero.username")}</Label>
                    <Input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-blue-900/50 border-blue-500 text-white placeholder:text-blue-300/70 h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-xs">{t("hero.password")}</Label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-blue-900/50 border-blue-500 text-white placeholder:text-blue-300/70 h-10"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-white text-blue-800 hover:bg-blue-100 h-10" disabled={loading}>
                    {loading ? t("hero.signingIn") : t("hero.signIn")}
                  </Button>
                </form>
                <div className="mt-3 text-center">
                  <Link href="/forgot-password" className="text-white/80 text-xs hover:underline">
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
