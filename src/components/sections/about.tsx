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
    <section id="about" className="relative isolate overflow-hidden py-16 sm:py-24">
      <img src="/images/about.jpeg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-950/85 via-blue-900/75 to-gray-950/90" />

      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-blue-300 text-sm font-medium mb-2"><T k="about.eyebrow" /></p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white"><T k="about.heading" /></h2>
          <p className="text-blue-50/90 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            <T k="about.body" />
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
          {stats.map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs sm:text-sm text-blue-100 mt-1"><T k={s.labelKey} /></p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.titleKey} className="flex gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <p.icon className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1 text-white"><T k={p.titleKey} /></h3>
                <p className="text-blue-50/80 text-sm leading-relaxed"><T k={p.descKey} /></p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {blocks.map((b) => (
            <div key={b.titleKey} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <h3 className="font-bold text-blue-200 mb-2"><T k={b.titleKey} /></h3>
              <p className="text-blue-50/80 text-sm leading-relaxed"><T k={b.descKey} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
