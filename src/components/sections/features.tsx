import { CreditCard, Smartphone, TrendingUp } from "lucide-react";
import { T } from "@/lib/i18n";

const features = [
  { icon: CreditCard, titleKey: "features.fastTransfers.title", descKey: "features.fastTransfers.desc" },
  { icon: Smartphone, titleKey: "features.mobileBanking.title", descKey: "features.mobileBanking.desc" },
  { icon: TrendingUp, titleKey: "features.growMoney.title", descKey: "features.growMoney.desc" },
];

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-green-50/70 py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-green-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <T k="features.eyebrow" />
          </span>
          <h2 className="mt-4 bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
            <T k="features.heading" />
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.titleKey}
              className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-green-900/5"
            >
              <span className="absolute inset-x-8 top-0 h-1 origin-left scale-x-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-transform duration-300 group-hover:scale-x-100" />
              <span className="absolute right-6 top-4 select-none text-6xl font-black text-green-50/80">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg shadow-green-600/20 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900"><T k={f.titleKey} /></h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600"><T k={f.descKey} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
