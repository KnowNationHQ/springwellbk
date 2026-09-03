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
      <div className="text-center mb-10 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900"><T k="services.eyebrow2" /></h2>
        <p className="text-gray-600 text-sm mt-2 max-w-2xl mx-auto">
          We offer products and services for your personal and professional banking needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {services.map((svc) => (
          <div key={svc.titleKey} className="relative group overflow-hidden cursor-pointer">
            <img src={svc.img} alt="" className="w-full h-64 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-lg font-bold mb-1"><T k={svc.titleKey} /></h3>
              <p className="text-sm opacity-90 leading-relaxed"><T k={svc.descKey} /></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
