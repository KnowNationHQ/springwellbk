import Link from "next/link";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"><T k="cta.heading" /></h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            Understanding money is the key to financial freedom. Money is like a seed, when you plant it multiplies, this is why SpringWell Bank was created to help people understand money and plant seeds to yield fruits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <p className="text-lg text-gray-700 italic mb-4">
              &ldquo;The world is a financial village. Understanding money is the key to financial freedom. Money is like a seed &mdash; when you plant it, it multiplies. That is why SpringWell was created: to help people understand money and plant seeds that yield fruit.&rdquo;
            </p>
            <p className="text-sm font-semibold text-[#426FB6]">President of SpringWell Bank</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-[#426FB6] mb-1"><T k="about.mission.title" /></h3>
              <p className="text-sm text-gray-600"><T k="about.mission.desc" /></p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-[#426FB6] mb-1"><T k="about.vision.title" /></h3>
              <p className="text-sm text-gray-600"><T k="about.vision.desc" /></p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-bold text-[#426FB6] mb-1"><T k="about.what.title" /></h3>
              <p className="text-sm text-gray-600"><T k="about.what.desc" /></p>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">INTERESTED IN JOINING US?</h2>
          <p className="text-gray-600 text-sm mb-6 max-w-xl mx-auto">
            We spoke to 10,000 savers in 10 markets to find the wealth they can expect at age 60 compared to their aspirations for retirement
          </p>
          <Button asChild size="lg" className="bg-[#426FB6] hover:bg-[#3560a0] text-white">
            <Link href="/register">FIND OUT MORE</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
