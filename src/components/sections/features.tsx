import { T } from "@/lib/i18n";

const features = [
  { titleKey: "features.easyToUse.title", descKey: "features.easyToUse.desc" },
  { titleKey: "features.support247.title", descKey: "features.support247.desc" },
  { titleKey: "features.hybridAccounts.title", descKey: "features.hybridAccounts.desc" },
];

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.titleKey} className="p-6 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-bold text-lg mb-2 text-gray-900"><T k={f.titleKey} /></h3>
              <p className="text-sm leading-relaxed text-gray-600"><T k={f.descKey} /></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
