import Link from "next/link";
import { Landmark } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Landmark className="h-5 w-5" />
              SpringWell Bank
            </Link>
            <p className="text-green-200 text-sm leading-relaxed max-w-xs">
              Secure, modern banking designed for you. Open an account in minutes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-green-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/loan" className="hover:text-white transition-colors">Loan</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-green-300">Accounts</h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li><Link href="/register" className="hover:text-white transition-colors">Checking</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Savings</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-green-300">Support</h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li><Link href="/#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><a href="mailto:support@springwellbk.com" className="hover:text-white transition-colors">support@springwellbk.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-green-300">
          <p>&copy; {new Date().getFullYear()} SpringWell Bank. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/#about" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/#about" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
