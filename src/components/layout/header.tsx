"use client";

import Link from "next/link";
import { Menu, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/loan", label: "Loan" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-green-800 text-white">
      <div className="hidden md:block bg-green-900 text-green-200 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-9">
          <div className="flex items-center gap-4">
            <a href="mailto:support@springwellbk.com" className="hover:text-white transition-colors">support@springwellbk.com</a>
            <span>+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition-colors">Online Banking</Link>
            <Link href="/#contact" className="hover:text-white transition-colors">Contact</Link>
            <Link href="/register" className="hover:text-white transition-colors font-semibold">Open an Account</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <Landmark className="h-5 w-5 md:h-6 md:w-6" />
          SpringWell Bank
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-green-300 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild className="text-white hover:text-green-300 hover:bg-green-700">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-white text-green-800 hover:bg-green-100">
            <Link href="/register">Open Account</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-green-700" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] max-w-sm overflow-y-auto bg-green-900 text-white border-green-700 p-0">
            <SheetHeader className="px-5 h-14 border-b border-green-700 flex-row items-center justify-start gap-2 space-y-0">
              <Landmark className="h-5 w-5" />
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col p-3 gap-1">
              {NAV.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center py-3 px-3 rounded-lg hover:bg-green-800 transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto p-3 border-t border-green-700 space-y-2">
              <SheetClose asChild>
                <Button asChild variant="outline" className="w-full text-white border-green-700 hover:bg-green-800">
                  <Link href="/login">Log In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="w-full bg-white text-green-800 hover:bg-green-100">
                  <Link href="/register">Open Account</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
