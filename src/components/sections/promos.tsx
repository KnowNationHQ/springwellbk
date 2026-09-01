import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { T } from "@/lib/i18n";

const promos = [
  { eyebrowKey: "promo.checking.eyebrow", titleKey: "promo.checking.title", descKey: "promo.checking.desc", ctaKey: "promo.checking.cta", href: "/register", bg: "from-blue-700 to-blue-900", img: "/images/promo-checking.jpeg" },
  { eyebrowKey: "promo.business.eyebrow", titleKey: "promo.business.title", descKey: "promo.business.desc", ctaKey: "promo.business.cta", href: "/register", bg: "from-blue-600 to-blue-800", img: "/images/promo-business.jpeg" },
  { eyebrowKey: "promo.home.eyebrow", titleKey: "promo.home.title", descKey: "promo.home.desc", ctaKey: "promo.home.cta", href: "/loan", bg: "from-blue-700 to-blue-900", img: "/images/promo-home.jpeg" },
  { eyebrowKey: "promo.savings.eyebrow", titleKey: "promo.savings.title", descKey: "promo.savings.desc", ctaKey: "promo.savings.cta", href: "/register", bg: "from-blue-600 to-blue-800", img: "/images/promo-savings.jpeg" },
];

export function PromosSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-blue-600 text-sm font-medium mb-2"><T k="promos.eyebrow" /></p>
          <h2 className="text-2xl sm:text-3xl font-bold"><T k="promos.heading" /></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promos.map((p) => (
            <div key={p.titleKey} className={`rounded-2xl overflow-hidden text-white bg-gradient-to-br ${p.bg} flex flex-col`}>
              <img src={p.img} alt="" aria-hidden className="w-full h-36 object-cover" />
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs font-semibold tracking-wide opacity-80 mb-2"><T k={p.eyebrowKey} /></p>
                <h3 className="font-bold text-lg mb-2 leading-snug"><T k={p.titleKey} /></h3>
                <p className="text-sm text-white/80 leading-relaxed mb-4 flex-1"><T k={p.descKey} /></p>
                <Link href={p.href} className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all">
                  <T k={p.ctaKey} /> <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
