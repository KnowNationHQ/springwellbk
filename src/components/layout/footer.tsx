import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#211e1e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-gray-400">Need to talk to us directly?</span>
            <Link href="/#contact" className="text-white hover:underline font-medium">Contact us</Link>
            <span className="text-gray-600">|</span>
            <Link href="/#about" className="text-white hover:underline">About</Link>
            <Link href="/#services" className="text-white hover:underline">Services</Link>
            <Link href="/register" className="text-white hover:underline">Open an account</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#444]">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} SpringWell Bank. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
