"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Menu, X, Search, HelpCircle, ChevronDown } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";

interface BankNavProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    imageId?: string;
  };
  onOpenProfile?: () => void;
  role?: "admin" | "customer";
}

const CUSTOMER_NAV = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Transfer", href: "/transfer" },
];

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Pending", href: "/admin#pending" },
  { label: "All Accounts", href: "/admin#accounts" },
  { label: "Activate", href: "/admin#accounts" },
  { label: "Wire Transfer", href: "/admin/transfer" },
];

export function BankNav({ user, onOpenProfile, role = "customer" }: BankNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => { setUserId(localStorage.getItem("userId")); }, []);

  const frozenTransfers = useQuery(
    api.auth.getMyFrozenTransfers,
    userId && role === "customer" ? { userId: userId as any } : "skip"
  );

  const pendingCount = frozenTransfers?.length ?? 0;

  const customerNav = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transfer", href: "/transfer" },
    ...(pendingCount > 0 ? [{ label: `Pending Verification (${pendingCount})`, href: "/dashboard#pending-verification" }] : []),
  ];

  const navItems = role === "admin" ? ADMIN_NAV : customerNav;

  function handleSignOut() {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  return (
    <>
      {/* Row 1: Primary Navigation — desktop */}
      <nav className="hidden md:block bg-[#434343] text-white">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-9">
          <div className="flex items-center gap-0">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3.5 py-2 text-[13px] no-underline border-b-2 ${
                  pathname === item.href
                    ? "text-[#FEDF01] border-[#FEDF01] font-bold"
                    : "text-white border-transparent"
                } flex items-center gap-1`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Row 1: Primary Navigation — mobile */}
      <nav className="md:hidden bg-[#434343] text-white">
        <div className="px-4 flex items-center justify-between h-11">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="text-white no-underline font-bold text-sm">
            <img src="/logo.svg" alt="SpringWell Bank" className="h-6 w-auto" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <div className="bg-[#333] border-t border-[#555]">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-5 py-3.5 text-sm no-underline border-b border-[#444] ${
                  pathname === item.href ? "text-[#FEDF01] font-bold" : "text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-5 py-3.5 text-sm text-red-400 border-b border-[#444]"
            >
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* Row 2: Logo Bar — desktop */}
      <div className="hidden md:block bg-white border-b border-gray-300">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between py-2.5">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <img src="/logo.svg" alt="SpringWell Bank" className="h-[40px]" />
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/forgot-password" className="flex items-center gap-1.5 text-[#333] text-sm no-underline">
              <HelpCircle size={16} className="text-[#426FB6]" /> Help & Support
            </Link>
            <Link href="/#contact" className="text-[#333] text-sm no-underline">Contact Us</Link>
            <div className="relative">
              <button
                onClick={() => setSignOutOpen(!signOutOpen)}
                className="flex items-center gap-1 text-[14px] p-1.5"
              >
                <span className="text-[#426FB6] font-semibold">Sign Out</span> <ChevronDown size={14} />
              </button>
              {signOutOpen && (
                <div className="absolute right-0 top-full bg-white border border-gray-300 rounded p-2 min-w-[160px] shadow-lg z-50">
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm text-[#333]">Sign Out</button>
                </div>
              )}
            </div>
            <div className="bg-[#FEDF01] px-4 py-2 rounded font-bold text-[13px] text-black whitespace-nowrap">
              Signed In As {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Logo Bar — mobile */}
      <div className="md:hidden bg-white border-b border-gray-300">
        <div className="px-4 flex items-center justify-between py-2.5">
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <img src="/logo.svg" alt="SpringWell Bank" className="h-[36px]" />
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="text-[#426FB6] text-sm font-semibold p-0 bg-transparent border-none cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Profile Row — desktop */}
      <div className="hidden md:block bg-white border-b border-gray-300 py-5">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <UserAvatar imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} size={220} />
            <div className="flex items-center gap-5">
              <h2 className="text-2xl font-bold m-0 text-black">Hello, {user.firstName}</h2>
              <button onClick={onOpenProfile} className="text-[#426FB6] text-base no-underline bg-transparent border-none cursor-pointer p-0">Update profile</button>
              <button onClick={onOpenProfile} className="text-[#426FB6] text-base no-underline bg-transparent border-none cursor-pointer p-0">Security center</button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="How can we help you?"
              className="py-2 pr-9 pl-3 border border-gray-300 rounded text-sm w-[220px] font-[inherit] text-gray-500"
            />
            <Search size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Row 3: Profile Row — mobile */}
      <div className="md:hidden bg-white border-b border-gray-300 py-4 px-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <UserAvatar imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} size={80} />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <h2 className="text-lg font-bold m-0 text-black truncate">Hello, {user.firstName}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <button onClick={onOpenProfile} className="text-[#426FB6] text-xs no-underline bg-transparent border-none cursor-pointer p-0">Update profile</button>
              <button onClick={onOpenProfile} className="text-[#426FB6] text-xs no-underline bg-transparent border-none cursor-pointer p-0">Security center</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
