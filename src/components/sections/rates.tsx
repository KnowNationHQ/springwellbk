import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiggyBank, Home } from "lucide-react";

export function RatesSection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">Rates & Offers</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Make your money work harder</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="font-bold text-lg">Certificate of Deposit</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">Make your money grow with our 14-month CD.</p>
            <p className="text-4xl font-bold text-green-700 mb-4">2.00% <span className="text-lg">APY*</span></p>
            <Button asChild variant="outline" className="mt-auto border-green-600 text-green-700 hover:bg-green-50 w-fit">
              <Link href="/register">Open a CD</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="font-bold text-lg">Home Equity Line</h3>
            </div>
            <p className="text-gray-600 text-sm mb-3">Take advantage of a great equity rate!</p>
            <p className="text-2xl font-bold text-green-700 mb-1">2.49% <span className="text-base font-semibold">APR*</span> <span className="text-sm text-gray-500 font-normal">for first 6 months</span></p>
            <p className="text-xs text-gray-500 mb-4">Variable rates after introductory period as low as 6.00% APR for amounts ≥ $100,000 and 6.25% APR for amounts &lt; $100,000.</p>
            <Button asChild className="mt-auto bg-green-600 hover:bg-green-700 w-fit">
              <Link href="/loan">Apply Online</Link>
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">*Rates are illustrative and subject to change. SpringWell Bank is a demonstration project.</p>
      </div>
    </section>
  );
}
