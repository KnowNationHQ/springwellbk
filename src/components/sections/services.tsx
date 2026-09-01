import Link from "next/link";
import { Button } from "@/components/ui/button";
import { T } from "@/lib/i18n";
import { CreditCard, PiggyBank, Building2, ArrowRight } from "lucide-react";

const offerings = [
  { img: "/images/service-loans.jpeg", titleKey: "offering.loans.title", descKey: "offering.loans.desc", href: "/loan" },
  { img: "/images/service-transfer.jpeg", titleKey: "offering.transfer.title", descKey: "offering.transfer.desc", href: "/dashboard" },
  { img: "/images/service-net.jpeg", titleKey: "offering.net.title", descKey: "offering.net.desc", href: "/login" },
  { img: "/images/service-prepaid.jpeg", titleKey: "offering.prepaid.title", descKey: "offering.prepaid.desc", href: "/register" },
  { img: "/images/service-mcash.jpeg", titleKey: "offering.mcash.title", descKey: "offering.mcash.desc", href: "/register" },
  { img: "/images/service-cards.jpeg", titleKey: "offering.cards.title", descKey: "offering.cards.desc", href: "/register" },
];

const accounts = [
  { icon: CreditCard, titleKey: "account.checking.title", apr: "0.01% APY", features: ["account.checking.f1", "account.checking.f2", "account.checking.f3"], color: "green" },
  { icon: PiggyBank, titleKey: "account.savings.title", apr: "4.25% APY", features: ["account.savings.f1", "account.savings.f2", "account.savings.f3"], color: "emerald" },
  { icon: Building2, titleKey: "account.business.title", apr: "0.05% APY", features: ["account.business.f1", "account.business.f2", "account.business.f3"], color: "teal" },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2"><T k="services.eyebrow" /></p>
          <h2 className="text-2xl sm:text-3xl font-bold"><T k="services.heading" /></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {accounts.map((a) => (
            <div key={a.titleKey} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <a.icon className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-1"><T k={a.titleKey} /></h3>
              <p className="text-green-600 font-bold text-xl mb-4">{a.apr}</p>
              <ul className="space-y-2 mb-6">
                {a.features.map((fk) => (
                  <li key={fk} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    <T k={fk} />
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                <Link href="/register">
                  <T k="services.getStarted" /> <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <div className="text-center mb-8">
            <p className="text-green-600 text-sm font-medium mb-2"><T k="services.eyebrow2" /></p>
            <h3 className="text-xl sm:text-2xl font-bold"><T k="services.heading2" /></h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((o) => (
              <Link key={o.titleKey} href={o.href} className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-green-300 transition-all">
                <div className="relative h-44 sm:h-52 overflow-hidden">
                  <img src={o.img} alt="" aria-hidden className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-base mb-1"><T k={o.titleKey} /></h4>
                  <p className="text-gray-600 text-sm leading-relaxed"><T k={o.descKey} /></p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
