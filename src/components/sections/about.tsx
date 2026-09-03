import { T } from "@/lib/i18n";

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"><T k="about.heading" /></h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Since our incorporation in 2006, we have helped millions of people across the globe with international standard of banking services by proving cost effective loans and funds security for the betterment of global economy.
        </p>
      </div>
    </section>
  );
}
