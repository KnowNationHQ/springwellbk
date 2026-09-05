"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function DashboardFooter({ lastLogin }: { lastLogin?: number }) {
  const router = useRouter();
  return (
    <>
      <p className="text-[13px] text-gray-500 leading-relaxed my-4">
        For checking, savings, and money market accounts, the balance may reflect transaction that have not yet posted to your account. For credit card Gold option and Gold reserve accounts, the balance may not reflect recent transactions or pending payments.
      </p>
      {lastLogin && (
        <p className="text-[13px] text-gray-500 mb-4">
          Last sign in {new Date(lastLogin).toLocaleString()}
        </p>
      )}
      <div className="bg-white border border-gray-300 rounded p-3 px-5 flex justify-between items-center mb-8">
        <span className="text-sm font-semibold text-gray-700">Secure Area</span>
        <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} className="text-sm text-[#426FB6] cursor-pointer">Sign out</button>
      </div>
    </>
  );
}

export function DashboardFullFooter() {
  return (
    <div className="bg-[#eee] border-t border-gray-300">
      <div className="max-w-[600px] mx-auto py-10 px-5">
        <div className="text-center text-[13px] text-[#426FB6] mb-2">
          <Link href="/" className="text-[#426FB6] no-underline">Contact Us</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/#about" className="text-[#426FB6] no-underline">About SpringWell</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/#services" className="text-[#426FB6] no-underline">Services</Link>
        </div>
        <p className="text-center text-xs text-gray-500 mb-1">Phone +44 7445 182201 / NMLS ID 411068</p>
        <p className="text-center text-xs text-gray-500">Copyright &copy; 2026 SpringWell Bank. All Rights Reserved.</p>
      </div>
    </div>
  );
}
