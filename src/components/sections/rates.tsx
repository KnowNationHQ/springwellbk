import Link from "next/link";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { PiggyBank, Home, Gift } from "lucide-react";

export function RatesSection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-blue-600 text-sm font-medium mb-2"><T k="rates.eyebrow" /></p>
          <h2 className="text-2xl sm:text-3xl font-bold"><T k="rates.heading" /></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="font-bold text-lg"><T k="rates.cd.title" /></h3>
            </div>
            <p className="text-gray-600 text-sm mb-3"><T k="rates.cd.desc" /></p>
            <p className="text-4xl font-bold text-blue-700 mb-4">2.00% <span className="text-lg">APY*</span></p>
            <Button asChild variant="outline" className="mt-auto border-blue-600 text-blue-700 hover:bg-blue-50 w-fit">
              <Link href="/register"><T k="rates.cd.cta" /></Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="font-bold text-lg"><T k="rates.heloc.title" /></h3>
            </div>
            <p className="text-gray-600 text-sm mb-3"><T k="rates.heloc.desc" /></p>
            <p className="text-2xl font-bold text-blue-700 mb-1">2.49% <span className="text-base font-semibold">APR*</span> <span className="text-sm text-gray-500 font-normal"><T k="rates.heloc.term" /></span></p>
            <p className="text-xs text-gray-500 mb-4">Variable rates after introductory period as low as 6.00% APR for amounts ≥ $100,000 and 6.25% APR for amounts &lt; $100,000.</p>
            <Button asChild className="mt-auto bg-blue-600 hover:bg-blue-700 w-fit">
              <Link href="/loan"><T k="rates.heloc.cta" /></Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col">
            <span className="mb-3 inline-flex w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"><T k="promo.checking.eyebrow" /></span>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Gift className="h-5 w-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold leading-tight"><T k="promo.checking.title" /></h3>
            </div>
            <p className="mb-4 text-sm text-gray-600"><T k="promo.checking.desc" /></p>
            <Button asChild variant="outline" className="mt-auto w-fit border-blue-600 text-blue-700 hover:bg-blue-50">
              <Link href="/register"><T k="promo.checking.cta" /></Link>
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center"><T k="rates.footnote" /></p>
      </div>
    </section>
  );
}
