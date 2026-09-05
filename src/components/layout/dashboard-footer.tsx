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
        <div className="flex gap-5">
          <button onClick={() => alert("Spanish language support coming soon!")} className="text-sm text-[#426FB6] cursor-pointer">En Espanol</button>
          <button onClick={() => { localStorage.removeItem("userId"); router.push("/login"); }} className="text-sm text-[#426FB6] cursor-pointer">Sign out</button>
        </div>
      </div>
    </>
  );
}

export function DashboardFullFooter() {
  return (
    <div className="bg-[#eee] border-t border-gray-300">
      <div className="max-w-[600px] mx-auto py-10 px-5">
        <h3 className="text-xl font-bold text-center mb-5 text-gray-700">Subscribe to Our Email List</h3>
        <div className="flex flex-col gap-3 mb-8">
          <input type="text" placeholder="FULLNAME" className="p-3 px-4 border border-gray-300 rounded text-sm font-[inherit]" />
          <input type="email" placeholder="EMAIL" className="p-3 px-4 border border-gray-300 rounded text-sm font-[inherit]" />
          <button className="py-3.5 bg-[#426FB6] text-white border-none rounded text-sm font-bold cursor-pointer tracking-wide" onClick={() => alert("Thank you for subscribing!")}>SIGN UP</button>
        </div>
        <p className="text-base text-center mb-3 text-gray-700">
          <span className="text-[#426FB6] font-bold">Download</span> our free mobile App today!
        </p>
        <div className="flex justify-center gap-3 mb-8">
          <div className="bg-black text-white py-2 px-4 rounded-md text-[11px] flex items-center gap-1.5">
            <span className="text-lg">Apple</span>
            <div>
              <div className="text-[8px] opacity-80">Download on the</div>
              <div className="font-bold text-xs">App Store</div>
            </div>
          </div>
          <div className="bg-black text-white py-2 px-4 rounded-md text-[11px] flex items-center gap-1.5">
            <span className="text-lg text-[#4285F4]">Play</span>
            <div>
              <div className="text-[8px] opacity-80">GET IT ON</div>
              <div className="font-bold text-xs">Google Play</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          {["#3b5998", "#1DA1F2", "#0077B5", "#E1306C", "#FF0000"].map((color, i) => (
            <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
              <span className="text-white font-bold text-base">{["f", "t", "in", "ig", "\u25B6"][i]}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-[13px] text-[#426FB6] mb-2">
          <Link href="/" className="text-[#426FB6] no-underline">Contact Us</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/#about" className="text-[#426FB6] no-underline">About SpringWell</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/#services" className="text-[#426FB6] no-underline">Services</Link>
          <span className="mx-1.5 text-gray-400">/</span>
          <Link href="/" className="text-[#426FB6] no-underline">Disclosure & Privacy Policy</Link>
        </div>
        <p className="text-center text-xs text-gray-500 mb-1">Phone +44 7445 182201 / NMLS ID 411068</p>
        <p className="text-center text-xs text-gray-500">Copyright &copy; 2026 SpringWell Bank. All Rights Reserved.</p>
      </div>
    </div>
  );
}
