import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { T } from "@/lib/i18n";

const promos = [
  { eyebrowKey: "promo.checking.eyebrow", titleKey: "promo.checking.title", descKey: "promo.checking.desc", ctaKey: "promo.checking.cta", href: "/register", img: "/images/promo-checking.jpeg" },
  { eyebrowKey: "promo.business.eyebrow", titleKey: "promo.business.title", descKey: "promo.business.desc", ctaKey: "promo.business.cta", href: "/register", img: "/images/promo-business.jpeg" },
  { eyebrowKey: "promo.home.eyebrow", titleKey: "promo.home.title", descKey: "promo.home.desc", ctaKey: "promo.home.cta", href: "/register", img: "/images/promo-home.jpeg" },
  { eyebrowKey: "promo.savings.eyebrow", titleKey: "promo.savings.title", descKey: "promo.savings.desc", ctaKey: "promo.savings.cta", href: "/register", img: "/images/promo-savings.jpeg" },
];

export function PromosSection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promos.map((p) => (
            <div key={p.titleKey} className="rounded-xl overflow-hidden bg-white border border-gray-200 flex flex-col">
              <img src={p.img} alt="" aria-hidden="true" className="w-full h-40 object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs font-bold tracking-wide text-[#426FB6] mb-1"><T k={p.eyebrowKey} /></p>
                <h2 className="font-bold text-base mb-2 leading-snug text-gray-900"><T k={p.titleKey} /></h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1"><T k={p.descKey} /></p>
                <Link href={p.href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#426FB6] hover:gap-2 transition-all">
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
