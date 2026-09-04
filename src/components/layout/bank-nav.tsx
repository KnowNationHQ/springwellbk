"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Landmark, Menu, Search, HelpCircle, ChevronDown } from "lucide-react";

interface BankNavProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    imageId?: string;
  };
  activePage?: string;
}

const PRIMARY_NAV = [
  { label: "Online banking", href: "/dashboard", active: true },
  { label: "Business", href: "#" },
  { label: "Wealth", href: "#" },
  { label: "Institutional", href: "#", hasDropdown: true },
  { label: "ZXT Trust Capital labs", href: "#" },
  { label: "About ZXT Trust Capital", href: "#" },
];

const SUB_NAV = [
  { label: "TRANSACTIONS", href: "/dashboard" },
  { label: "BILL PAY", href: "#" },
  { label: "OPEN AN ACCOUNT", href: "#" },
  { label: "TRANSFER / SEND", href: "/transfer" },
  { label: "LOANS", href: "#" },
  { label: "SOCIAL OFFERS & IDEAS", href: "#" },
  { label: "TOOLS & INVESTING", href: "#" },
];

export function BankNav({ user, activePage }: BankNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  function handleSignOut() {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      {/* Row 1: Primary Navigation */}
      <nav style={{ backgroundColor: "#434343", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  color: item.active ? "#FEDF01" : "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  padding: "8px 14px",
                  borderBottom: item.active ? "2px solid #FEDF01" : "2px solid transparent",
                  fontWeight: item.active ? 700 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown size={12} style={{ opacity: 0.7 }} />}
              </Link>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 13, padding: "8px 0" }}
            className="desktop-hide"
          >
            Sign out
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 6 }}
            className="mobile-only"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Row 2: Logo Bar */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #ddd" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Landmark style={{ color: "#426FB6", width: 30, height: 30 }} />
            <span style={{ fontSize: 22, fontWeight: 700, color: "#426FB6", fontFamily: "'BentonSans', Arial, sans-serif" }}>SpringWell Bank</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="#" style={{ color: "#333", fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <HelpCircle size={16} style={{ color: "#426FB6" }} /> Help & Support
            </a>
            <a href="#" style={{ color: "#333", fontSize: 14, textDecoration: "none" }}>&gt; Contact Us</a>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSignOutOpen(!signOutOpen)}
                style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 4, padding: "6px 0" }}
              >
                <span style={{ color: "#426FB6", fontWeight: 600 }}>Sign Out</span> <ChevronDown size={14} />
              </button>
              {signOutOpen && (
                <div style={{ position: "absolute", right: 0, top: "100%", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: 4, padding: 8, minWidth: 160, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 100 }}>
                  <button onClick={handleSignOut} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#333" }}>Sign Out</button>
                </div>
              )}
            </div>
            <div style={{ backgroundColor: "#FEDF01", padding: "8px 16px", borderRadius: 4, fontWeight: 700, fontSize: 13, color: "#000", whiteSpace: "nowrap" }}>
              Signed In As {user.firstName} {user.lastName}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Sub Navigation */}
      <div style={{ backgroundColor: "#426FB6" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
          {SUB_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 400,
                  padding: "14px 16px",
                  whiteSpace: "nowrap",
                  borderBottom: isActive ? "3px solid #fff" : "3px solid transparent",
                  letterSpacing: 0.5,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Row 4: Profile Row */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #ddd", padding: "12px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", backgroundColor: "#426FB6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, overflow: "hidden" }}>
              {user.imageId ? (
                <img
                  src={`/api/storage/${user.imageId}`}
                  alt={user.firstName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#000" }}>Hello, {user.firstName} {user.lastName}</h2>
              <Link href="/dashboard" style={{ color: "#426FB6", fontSize: 14, textDecoration: "none" }}>Update profile</Link>
              <Link href="/dashboard" style={{ color: "#426FB6", fontSize: 14, textDecoration: "none" }}>Security center</Link>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="How can we help you?"
              style={{
                padding: "8px 36px 8px 12px",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: 14,
                width: 220,
                fontFamily: "inherit",
                color: "#999",
              }}
            />
            <Search size={16} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .desktop-hide { display: none; }
        .mobile-only { display: none; }
        @media (max-width: 768px) {
          .desktop-hide { display: block; }
          .mobile-only { display: block; }
        }
      `}</style>
    </>
  );
}
