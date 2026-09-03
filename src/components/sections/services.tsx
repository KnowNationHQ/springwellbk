"use client";

import { useState } from "react";
import { T } from "@/lib/i18n";
import { ChevronLeft, ChevronRight } from "lucide-react";

const services = [
  { titleKey: "offering.loans.title", descKey: "offering.loans.desc", img: "/images/service-loans.jpeg" },
  { titleKey: "offering.transfer.title", descKey: "offering.transfer.desc", img: "/images/service-transfer.jpeg" },
  { titleKey: "offering.prepaid.title", descKey: "offering.prepaid.desc", img: "/images/service-prepaid.jpeg" },
  { titleKey: "offering.net.title", descKey: "offering.net.desc", img: "/images/service-net.jpeg" },
  { titleKey: "offering.mcash.title", descKey: "offering.mcash.desc", img: "/images/service-mcash.jpeg" },
];

export function ServicesSection() {
  const [current, setCurrent] = useState(0);

  function prev() {
    setCurrent((c) => (c === 0 ? services.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === services.length - 1 ? 0 : c + 1));
  }

  return (
    <section id="services" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900"><T k="services.eyebrow2" /></h2>
          <p className="text-gray-600 text-sm mt-2 max-w-2xl mx-auto">
            We offer products and services for your personal and professional banking needs.
          </p>
        </div>

        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={prev} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1 text-center">
              <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                <img src={services[current].img} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2"><T k={services[current].titleKey} /></h3>
                <p className="text-sm text-gray-600"><T k={services[current].descKey} /></p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {services.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-[#426FB6]" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <button onClick={next} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
