import { CreditCard, Smartphone, TrendingUp } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Fast Transfers",
    description: "Send and receive money instantly with zero fees on domestic transfers.",
  },
  {
    icon: Smartphone,
    title: "Mobile Banking",
    description: "Manage your accounts anytime, anywhere from your phone or tablet.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Money",
    description: "Earn competitive interest rates on savings and investment accounts.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Modern Banking for Everyone</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <f.icon className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="font-bold mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
