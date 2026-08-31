import { Shield, Clock, Headphones } from "lucide-react";

const stats = [
  { value: "$2B+", label: "Assets Managed" },
  { value: "150K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
];

const pillars = [
  { icon: Shield, title: "Security First", desc: "Bank-level encryption and FDIC insurance protect every transaction." },
  { icon: Clock, title: "Instant Access", desc: "Real-time balance updates and instant notifications on every activity." },
  { icon: Headphones, title: "24/7 Support", desc: "Our team is always available to help via chat, email, or phone." },
];

export function AboutSection() {
  return (
    <section id="about" className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">About SpringWell</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Built on Trust, Driven by Innovation</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-sm sm:text-base">
            SpringWell Bank combines cutting-edge technology with traditional banking values to give you the best of both worlds.
          </p>
        </div>

        <img src="/images/about.svg" alt="" aria-hidden className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-2xl mb-10" />

        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-700">{s.value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="flex gap-4 p-4 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <p.icon className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{p.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { title: "Mission", desc: "To make secure, modern banking accessible to everyone and help our customers build a brighter financial future." },
            { title: "Vision", desc: "A world where everyone has a financial plan and contributes to a stronger, more inclusive global economy." },
            { title: "What we do", desc: "We are a modern financial institution helping people save, borrow, and grow their money with transparency and care." },
          ].map((b) => (
            <div key={b.title} className="p-6 rounded-2xl bg-green-50 border border-green-100">
              <h3 className="font-bold text-green-800 mb-2">{b.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
