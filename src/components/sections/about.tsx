import { Shield, Clock, Headphones } from "lucide-react";
import { T } from "@/lib/i18n";

const stats = [
  { value: "$2B+", labelKey: "about.stat1" },
  { value: "150K+", labelKey: "about.stat2" },
  { value: "99.9%", labelKey: "about.stat3" },
];

const pillars = [
  { icon: Shield, titleKey: "about.pillar1.title", descKey: "about.pillar1.desc" },
  { icon: Clock, titleKey: "about.pillar2.title", descKey: "about.pillar2.desc" },
  { icon: Headphones, titleKey: "about.pillar3.title", descKey: "about.pillar3.desc" },
];

const blocks = [
  { titleKey: "about.mission.title", descKey: "about.mission.desc" },
  { titleKey: "about.vision.title", descKey: "about.vision.desc" },
  { titleKey: "about.what.title", descKey: "about.what.desc" },
];

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2"><T k="about.eyebrow" /></p>
          <h2 className="text-2xl sm:text-3xl font-bold"><T k="about.heading" /></h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            <T k="about.body" />
          </p>
        </div>

        <img src="/images/about.jpeg" alt="" aria-hidden className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-2xl mb-10" />

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
          {stats.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-700">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1"><T k={s.labelKey} /></p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.titleKey} className="flex gap-4 p-4 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <p.icon className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1"><T k={p.titleKey} /></h3>
                <p className="text-gray-600 text-sm leading-relaxed"><T k={p.descKey} /></p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {blocks.map((b) => (
            <div key={b.titleKey} className="p-6 rounded-2xl bg-green-50 border border-green-100">
              <h3 className="font-bold text-green-800 mb-2"><T k={b.titleKey} /></h3>
              <p className="text-gray-600 text-sm leading-relaxed"><T k={b.descKey} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
