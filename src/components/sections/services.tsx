"use client";

import { T } from "@/lib/i18n";
import {
  Landmark,
  ArrowRightLeft,
  CreditCard,
  Globe,
  Smartphone,
  Wallet,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "offering.loans.title": Landmark,
  "offering.transfer.title": ArrowRightLeft,
  "offering.prepaid.title": CreditCard,
  "offering.net.title": Globe,
  "offering.mcash.title": Smartphone,
  "offering.cards.title": Wallet,
};

const services = [
  {
    titleKey: "offering.loans.title",
    descKey: "offering.loans.desc",
    eyebrowKey: "offering.loans.eyebrow",
    f1Key: "offering.loans.f1",
    f2Key: "offering.loans.f2",
    f3Key: "offering.loans.f3",
    ctaKey: "offering.loans.cta",
    img: "/images/service-loans.jpeg",
  },
  {
    titleKey: "offering.transfer.title",
    descKey: "offering.transfer.desc",
    eyebrowKey: "offering.transfer.eyebrow",
    f1Key: "offering.transfer.f1",
    f2Key: "offering.transfer.f2",
    f3Key: "offering.transfer.f3",
    ctaKey: "offering.transfer.cta",
    img: "/images/service-transfer.jpeg",
  },
  {
    titleKey: "offering.prepaid.title",
    descKey: "offering.prepaid.desc",
    eyebrowKey: "offering.prepaid.eyebrow",
    f1Key: "offering.prepaid.f1",
    f2Key: "offering.prepaid.f2",
    f3Key: "offering.prepaid.f3",
    ctaKey: "offering.prepaid.cta",
    img: "/images/service-prepaid.jpeg",
  },
  {
    titleKey: "offering.net.title",
    descKey: "offering.net.desc",
    eyebrowKey: "offering.net.eyebrow",
    f1Key: "offering.net.f1",
    f2Key: "offering.net.f2",
    f3Key: "offering.net.f3",
    ctaKey: "offering.net.cta",
    img: "/images/service-net.jpeg",
  },
  {
    titleKey: "offering.mcash.title",
    descKey: "offering.mcash.desc",
    eyebrowKey: "offering.mcash.eyebrow",
    f1Key: "offering.mcash.f1",
    f2Key: "offering.mcash.f2",
    f3Key: "offering.mcash.f3",
    ctaKey: "offering.mcash.cta",
    img: "/images/service-mcash.jpeg",
  },
  {
    titleKey: "offering.cards.title",
    descKey: "offering.cards.desc",
    eyebrowKey: "offering.cards.eyebrow",
    f1Key: "offering.cards.f1",
    f2Key: "offering.cards.f2",
    f3Key: "offering.cards.f3",
    ctaKey: "offering.cards.cta",
    img: "/images/service-cards.jpeg",
  },
];

function FeatureItem({ k }: { k: string }) {
  return (
    <li className="flex items-start gap-2 text-sm sm:text-base text-white/90">
      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 mt-0.5 shrink-0" />
      <T k={k} />
    </li>
  );
}

export function ServicesSection() {
  return (
    <section id="services" className="bg-white">
      <div className="text-center py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          <T k="services.eyebrow2" />
        </h2>
        <p className="text-gray-600 text-sm mt-2 max-w-2xl mx-auto">
          We offer products and services for your personal and professional banking needs.
        </p>
      </div>

      <div className="flex flex-col w-full">
        {services.map((svc) => {
          const Icon = iconMap[svc.titleKey];
          return (
            <div
              key={svc.titleKey}
              className="relative group overflow-hidden cursor-pointer h-screen min-h-[600px]"
            >
              {/* Background image */}
              <img
                src={svc.img}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

              {/* Content container */}
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16">
                <div className="max-w-3xl">
                  {/* Icon + Eyebrow */}
                  <div className="flex items-center gap-3 mb-4">
                    {Icon && (
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                      </div>
                    )}
                    <span className="text-emerald-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                      <T k={svc.eyebrowKey} />
                    </span>
                  </div>

                  {/* Title + Description (glass container) */}
                  <div className="backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl p-6 sm:p-8 mb-6">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                      <T k={svc.titleKey} />
                    </h3>
                    <p className="text-base sm:text-lg text-white/80 leading-relaxed max-w-xl">
                      <T k={svc.descKey} />
                    </p>

                    {/* Feature bullets */}
                    <ul className="mt-5 space-y-2">
                      <FeatureItem k={svc.f1Key} />
                      <FeatureItem k={svc.f2Key} />
                      <FeatureItem k={svc.f3Key} />
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3">
                    <a
                      href="/register"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 group/btn text-sm sm:text-base"
                    >
                      <T k={svc.ctaKey} />
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
