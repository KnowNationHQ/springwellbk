"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-green-800 text-white">
      <div className="max-w-7xl mx-auto flex h-14 md:h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <Landmark className="h-5 w-5 md:h-6 md:w-6" />
          SpringWell Bank
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-green-300 transition-colors">Home</Link>
          <Link href="/#about" className="hover:text-green-300 transition-colors">About</Link>
          <Link href="/#services" className="hover:text-green-300 transition-colors">Services</Link>
          <Link href="/loan" className="hover:text-green-300 transition-colors">Loan</Link>
          <Link href="/#contact" className="hover:text-green-300 transition-colors">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild className="text-white hover:text-green-300 hover:bg-green-700">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-white text-green-800 hover:bg-green-100">
            <Link href="/register">Open Account</Link>
          </Button>
        </div>

        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-green-900 border-t border-green-700 px-4 py-4 space-y-1">
          {[
            { href: "/", label: "Home" },
            { href: "/#about", label: "About" },
            { href: "/#services", label: "Services" },
            { href: "/loan", label: "Loan" },
            { href: "/#contact", label: "Contact" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-3 px-3 rounded hover:bg-green-700 transition-colors text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-green-700 mt-2 pt-2 space-y-1">
            <Link
              href="/login"
              className="block py-3 px-3 rounded hover:bg-green-700 transition-colors text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="block py-3 px-3 rounded bg-white text-green-800 text-center text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Open Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
