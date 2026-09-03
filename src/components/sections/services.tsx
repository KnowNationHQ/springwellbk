"use client";

import { T } from "@/lib/i18n";

const services = [
  { titleKey: "offering.loans.title", descKey: "offering.loans.desc", img: "/images/service-loans.jpeg" },
  { titleKey: "offering.transfer.title", descKey: "offering.transfer.desc", img: "/images/service-transfer.jpeg" },
  { titleKey: "offering.prepaid.title", descKey: "offering.prepaid.desc", img: "/images/service-prepaid.jpeg" },
  { titleKey: "offering.net.title", descKey: "offering.net.desc", img: "/images/service-net.jpeg" },
  { titleKey: "offering.mcash.title", descKey: "offering.mcash.desc", img: "/images/service-mcash.jpeg" },
  { titleKey: "offering.cards.title", descKey: "offering.cards.desc", img: "/images/service-cards.jpeg" },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900"><T k="services.eyebrow2" /></h2>
          <p className="text-gray-600 text-sm mt-2 max-w-2xl mx-auto">
            We offer products and services for your personal and professional banking needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.titleKey} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <img src={svc.img} alt="" className="w-full h-56 sm:h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2"><T k={svc.titleKey} /></h3>
                <p className="text-sm text-gray-600 leading-relaxed"><T k={svc.descKey} /></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
