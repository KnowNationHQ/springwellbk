import { T } from "@/lib/i18n";

export function WhyBankSection() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl"><T k="why.heading" /></h2>
          <p className="mt-3 text-gray-600 text-sm max-w-2xl mx-auto">
            We make it easy to bank, from personal accounts to investing your money, SpringWell Bank can help with financial products and services.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
            <h3 className="mb-2 text-lg font-bold text-gray-900"><T k="why.convenient.title" /></h3>
            <p className="text-sm leading-relaxed text-gray-600"><T k="why.convenient.desc" /></p>
          </div>
          <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
            <h3 className="mb-2 text-lg font-bold text-gray-900"><T k="why.hours.title" /></h3>
            <p className="text-sm leading-relaxed text-gray-600"><T k="why.hours.desc" /></p>
            <p className="mt-1 text-xs text-gray-400"><T k="why.hours.note" /></p>
          </div>
          <div className="rounded-xl bg-gray-50 p-6 border border-gray-200">
            <h3 className="mb-2 text-lg font-bold text-gray-900"><T k="why.security.title" /></h3>
            <p className="text-sm leading-relaxed text-gray-600"><T k="why.security.desc" /></p>
          </div>
        </div>
      </div>
    </section>
  );
}
