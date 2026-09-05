"use client";

import Link from "next/link";
import { Menu, UserCircle } from "lucide-react";
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
  { href: "/", labelKey: "nav.home" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/#services", labelKey: "nav.services" },
  { href: "/#contact", labelKey: "nav.contact" },
];

export function Header() {
  const t = useT();
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden md:block bg-[#434343] text-gray-300 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-9">
          <div className="flex items-center gap-4">
            <a href="mailto:support@springwellbk.com" className="hover:text-white transition-colors">support@springwellbk.com</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#contact" className="hover:text-white transition-colors">{t("nav.contact")}</Link>
            <Link href="/register" className="hover:text-white transition-colors font-semibold">{t("header.openAnAccount")}</Link>
            <span className="text-gray-400">Language:</span>
            <LanguageSwitcher className="bg-[#434343] border-[#555] text-gray-200 hover:bg-[#555] w-32" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-[#426FB6]">
            <img src="/logo.svg" alt="SpringWell Bank" className="h-8 w-auto md:h-10" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            {NAV.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[#426FB6] transition-colors">
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild className="bg-[#426FB6] hover:bg-[#3560a0] text-white !rounded-[5px]">
              <Link href="/login">{t("header.logIn")}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <a href="mailto:support@springwellbk.com" className="text-gray-400 hover:text-[#426FB6] text-xs transition-colors">support@springwellbk.com</a>
            <Link href="/login" aria-label={t("header.logIn")} className="text-gray-600 hover:text-[#426FB6] transition-colors">
              <UserCircle className="h-5 w-5" />
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-700 hover:bg-gray-100" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85%] max-w-sm overflow-y-auto bg-white text-gray-900 border-gray-200 p-0">
                <SheetHeader className="px-5 h-14 border-b border-gray-200 flex-row items-center justify-start gap-2 space-y-0">
                  <img src="/logo.svg" alt="" className="h-6 w-auto" />
                  <SheetTitle className="text-gray-900">{t("header.menu")}</SheetTitle>
                </SheetHeader>
                <div className="p-3 border-b border-gray-200">
                  <LanguageSwitcher className="w-full bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200" />
                </div>
                <nav className="flex flex-col p-3 gap-1">
                  {NAV.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center py-3 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto p-3 border-t border-gray-200 space-y-2">
                  <SheetClose asChild>
                    <Button asChild className="w-full bg-[#426FB6] hover:bg-[#3560a0] text-white">
                      <Link href="/login">{t("header.logIn")}</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Link href="/register">{t("header.openAccount")}</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
