"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Menu, X, Search, HelpCircle, ChevronDown, LogOut } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import Image from "next/image";

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
      {/* Desktop Top Bar */}
      <div className="hidden md:block bg-[#434343] text-white">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-10">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 text-[13px] no-underline rounded transition-colors ${
                  pathname === item.href
                    ? "text-[#FEDF01] font-bold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setSignOutOpen(!signOutOpen)}
                className="flex items-center gap-1.5 text-[13px] py-1 px-2 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="text-white font-medium">Sign Out</span>
                <ChevronDown size={13} />
              </button>
              {signOutOpen && (
                <div className="absolute right-0 top-full bg-white border border-gray-200 rounded-lg p-1.5 min-w-[140px] shadow-lg z-50 mt-1">
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 cursor-pointer">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Main Bar: Logo + Profile */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[72px]">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center no-underline shrink-0">
            <Image src="/logo.svg" alt="SpringWell Bank" width={140} height={27} priority style={{ height: "auto" }} />
          </Link>
          <div className="flex items-center gap-5 min-w-0">
            <Link href="/forgot-password" className="flex items-center gap-1.5 text-gray-600 text-sm no-underline hover:text-[#426FB6] transition-colors whitespace-nowrap">
              <HelpCircle size={15} /> Help
            </Link>
            <Link href="/#contact" className="text-gray-600 text-sm no-underline hover:text-[#426FB6] transition-colors whitespace-nowrap">Contact</Link>
            <div className="flex items-center gap-3 shrink-0">
              <UserAvatar imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} size={40} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-tight">{user.firstName} {user.lastName}</span>
                <span className="text-[11px] text-gray-400 font-mono">SWB-{userId?.slice(-8).toUpperCase() ?? ""}</span>
              </div>
              <button onClick={onOpenProfile} className="text-[#426FB6] text-xs bg-transparent border-none cursor-pointer p-0 hover:underline whitespace-nowrap">Edit</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 flex items-center justify-between h-18">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="no-underline">
            <Image src="/logo.svg" alt="SpringWell Bank" width={160} height={31} priority style={{ height: "auto" }} />
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
