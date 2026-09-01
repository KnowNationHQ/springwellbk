"use client";

import Link from "next/link";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useT } from "@/lib/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/login", labelKey: "header.onlineBanking" },
  { href: "/", labelKey: "nav.home" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/#services", labelKey: "nav.services" },
  { href: "/loan", labelKey: "nav.loan" },
  { href: "/#contact", labelKey: "nav.contact" },
];

export function Header() {
  const t = useT();
  return (
    <header className="sticky top-0 z-50 w-full bg-green-800 text-white">
      <div className="hidden md:block bg-green-900 text-green-200 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-9">
          <div className="flex items-center gap-4">
            <a href="mailto:support@springwellbk.com" className="hover:text-white transition-colors">support@springwellbk.com</a>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#contact" className="hover:text-white transition-colors">{t("nav.contact")}</Link>
            <Link href="/register" className="hover:text-white transition-colors font-semibold">{t("header.openAnAccount")}</Link>
            <span className="text-green-200">Language:</span>
            <LanguageSwitcher className="bg-green-800 border-green-700 text-green-100 hover:bg-green-700 w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <img src="/logo-white.svg" alt="SpringWell Bank" className="h-7 w-auto md:h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-300 transition-colors">
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild className="text-white hover:bg-green-700 !rounded-full">
            <Link href="/login">{t("header.logIn")}</Link>
          </Button>
          <Button asChild className="bg-white text-green-800 hover:bg-green-100 !rounded-[5px]">
            <Link href="/register">{t("header.openAccount")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <a href="mailto:support@springwellbk.com" className="text-green-200 hover:text-white text-xs transition-colors">support@springwellbk.com</a>
          <Link href="/login" aria-label={t("header.logIn")} className="text-white hover:text-green-300 transition-colors">
            <LogIn className="h-5 w-5" />
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-700" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto bg-green-900 text-white border-green-700 p-0">
            <SheetHeader className="px-5 h-14 border-b border-green-700 flex-row items-center justify-start gap-2 space-y-0">
              <img src="/logo-white.svg" alt="SpringWell Bank" className="h-7 w-auto" />
              <SheetTitle className="text-white">{t("header.menu")}</SheetTitle>
            </SheetHeader>
            <div className="p-3 border-b border-green-700">
              <LanguageSwitcher className="w-full bg-green-800 border-green-700 text-green-100 hover:bg-green-700" />
            </div>
            <nav className="flex flex-col p-3 gap-1">
              {NAV.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center py-3 px-3 rounded-lg hover:bg-green-800 transition-colors text-sm font-medium"
                  >
                    {t(link.labelKey)}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto p-3 border-t border-green-700 space-y-2">
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full bg-transparent border-white text-white hover:bg-green-800">
                  <Link href="/login">{t("header.logIn")}</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full bg-white text-green-800 hover:bg-green-100">
                  <Link href="/register">{t("header.openAccount")}</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
