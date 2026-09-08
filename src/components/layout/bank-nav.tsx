"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Menu, X, Search, HelpCircle, ChevronDown, LogOut } from "lucide-react";
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
  { label: "Frozen Transfers", href: "/admin/frozen" },
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

  const customerNav = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transfer", href: "/transfer" },
    { label: "Pending Verification", href: "/dashboard/pending" },
  ];

  const navItems = role === "admin" ? ADMIN_NAV : customerNav;

  function handleSignOut() {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  return (
    <>
      {/* Desktop Nav */}
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

      {/* Desktop Logo Bar */}
      <div className="hidden md:block bg-white border-b border-gray-300">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between py-2.5">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-2 no-underline">
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

      {/* Desktop Profile Row */}
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

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 flex items-center justify-between h-14">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="no-underline flex items-center gap-2">
            <img src="/logo.svg" alt="SpringWell Bank" className="h-7 w-auto" />
            <span className="text-[#1a3a5c] font-bold text-sm tracking-tight">SpringWell</span>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500" title="Sign out">
              <LogOut size={18} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center px-5 py-3.5 text-sm no-underline border-b border-gray-50 transition-colors ${
                  pathname === item.href ? "text-[#426FB6] font-semibold bg-blue-50" : "text-gray-700 active:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile Profile Row */}
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
