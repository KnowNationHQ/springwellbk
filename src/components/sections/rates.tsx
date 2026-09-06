import { T } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RatesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2"><T k="rates.cd.title" /></h2>
            <p className="text-gray-600 text-sm mb-4"><T k="rates.cd.desc" /></p>
            <p className="text-4xl font-bold text-[#426FB6] mb-4">2.00% <span className="text-lg">APY*</span></p>
            <Button asChild className="bg-[#426FB6] hover:bg-[#3560a0] text-white">
              <Link href="/register"><T k="rates.cd.cta" /></Link>
            </Button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2"><T k="rates.heloc.title" /></h2>
            <p className="text-gray-600 text-sm mb-2"><T k="rates.heloc.desc" /></p>
            <p className="text-sm text-gray-500 mb-1">Introductory rate:</p>
            <p className="text-4xl font-bold text-[#426FB6] mb-1">2.49% <span className="text-lg">APR*</span></p>
            <p className="text-sm text-gray-500 mb-4"><T k="rates.heloc.term" /></p>
            <p className="text-xs text-gray-500 mb-4">Variable rates after introductory period as low as 6.00% APR for amounts &ge; $100,000 and 6.25% APR for amounts &lt; $100,000.</p>
            <Button asChild variant="outline" className="border-[#426FB6] text-[#426FB6] hover:bg-blue-50">
              <Link href="/register"><T k="rates.heloc.cta" /></Link>
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center"><T k="rates.footnote" /></p>
      </div>
    </section>
  );
}
