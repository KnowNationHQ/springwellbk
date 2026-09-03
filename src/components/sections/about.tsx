import { T } from "@/lib/i18n";

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#426FB6] mb-2"><T k="about.eyebrow" /></p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"><T k="about.heading" /></h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
              Since our incorporation in 2006, we have helped millions of people across the globe with international standard of banking services by proving cost effective loans and funds security for the betterment of global economy.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#426FB6]">$45B+</p>
                <p className="text-xs text-gray-500"><T k="about.stat1" /></p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#426FB6]">2M+</p>
                <p className="text-xs text-gray-500"><T k="about.stat2" /></p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#426FB6]">99.9%</p>
                <p className="text-xs text-gray-500"><T k="about.stat3" /></p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="/images/about.jpeg" alt="About SpringWell Bank" className="rounded-2xl w-full h-80 object-cover shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
