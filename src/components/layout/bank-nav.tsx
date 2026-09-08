"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Menu, X, HelpCircle, ChevronDown, LogOut, Bell, Settings, Shield, CreditCard } from "lucide-react";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setUserId(localStorage.getItem("userId")); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const customerNav = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transfer", href: "/transfer" },
    { label: "Pending Verification", href: "/dashboard/pending" },
  ];

  const navItems = role === "admin" ? ADMIN_NAV : customerNav;
  const acctNum = userId?.slice(-8).toUpperCase() ?? "";
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase();

  function handleSignOut() {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  return (
    <>
      {/* Desktop Top Bar */}
      <div className="hidden md:block bg-[#1a3a5c] text-white">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-9">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 text-[12px] no-underline rounded transition-colors ${
                  pathname === item.href
                    ? "text-[#FEDF01] font-bold bg-white/5"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/50">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Desktop Main Bar: Logo + Profile */}
      <div className="hidden md:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between h-[68px]">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center no-underline shrink-0">
            <Image src="/logo.svg" alt="SpringWell Bank" width={130} height={25} priority style={{ height: "auto" }} />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/forgot-password" className="flex items-center gap-1.5 text-gray-500 text-[13px] no-underline hover:text-[#426FB6] transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <HelpCircle size={14} /> Help
            </Link>
            <Link href="/#contact" className="text-gray-500 text-[13px] no-underline hover:text-[#426FB6] transition-colors whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-gray-50">Contact</Link>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#426FB6]">
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent"
              >
                <div className="relative">
                  <UserAvatar imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} size={36} />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-semibold text-gray-900 leading-tight">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] text-gray-400 font-mono leading-tight">SWB-{acctNum}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 mt-2 w-[260px] overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <UserAvatar imageId={user.imageId} firstName={user.firstName} lastName={user.lastName} size={44} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 m-0 truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-gray-400 m-0 truncate">{user.email}</p>
                        <p className="text-[10px] text-[#426FB6] font-semibold m-0 mt-0.5 uppercase tracking-wide">{role} Account</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1.5">
                    <button onClick={() => { setProfileOpen(false); onOpenProfile?.(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none">
                      <Settings size={15} className="text-gray-400" /> Profile Settings
                    </button>
                    <button onClick={() => { setProfileOpen(false); onOpenProfile?.(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none">
                      <Shield size={15} className="text-gray-400" /> Security Center
                    </button>
                    <button onClick={() => { setProfileOpen(false); onOpenProfile?.(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer bg-transparent border-none">
                      <CreditCard size={15} className="text-gray-400" /> Card Management
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 py-1.5">
                    <button onClick={() => { setProfileOpen(false); handleSignOut(); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
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
