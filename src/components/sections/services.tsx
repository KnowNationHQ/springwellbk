import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, PiggyBank, Building2, ArrowRight } from "lucide-react";

const offerings = [
  { img: "/images/service-loans.svg", title: "Loans", desc: "Personal, auto, and home loans with fast approvals.", href: "/loan" },
  { img: "/images/service-transfer.svg", title: "Fund Transfer", desc: "Move money locally and internationally in seconds.", href: "/dashboard" },
  { img: "/images/service-net.svg", title: "Net Banking", desc: "Bank online securely from any device, 24/7.", href: "/login" },
  { img: "/images/service-prepaid.svg", title: "Prepaid Card", desc: "Load and spend with a contactless prepaid card.", href: "/register" },
  { img: "/images/service-mcash.svg", title: "Mcash", desc: "Tap-to-pay and mobile wallet integration.", href: "/register" },
  { img: "/images/service-cards.svg", title: "Debit & Credit", desc: "Everyday cards with rewards and zero hidden fees.", href: "/register" },
];

const accounts = [
  {
    icon: CreditCard,
    title: "Checking Account",
    apr: "0.01% APY",
    features: ["No monthly fees", "Free debit card", "Online & mobile banking"],
    color: "green",
  },
  {
    icon: PiggyBank,
    title: "Savings Account",
    apr: "4.25% APY",
    features: ["No minimum deposit", "Compound daily interest", "FDIC insured"],
    color: "emerald",
  },
  {
    icon: Building2,
    title: "Business Account",
    apr: "0.05% APY",
    features: ["Unlimited transactions", "Team access", "Invoice tools"],
    color: "teal",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">Our Products</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Choose the Right Account</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {accounts.map((a) => (
            <div key={a.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <a.icon className="h-5 w-5 text-green-700" />
              </div>
              <h3 className="font-bold text-lg mb-1">{a.title}</h3>
              <p className="text-green-600 font-bold text-xl mb-4">{a.apr}</p>
              <ul className="space-y-2 mb-6">
                {a.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
                <Link href="/register">
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <div className="text-center mb-8">
            <p className="text-green-600 text-sm font-medium mb-2">Services</p>
            <h3 className="text-xl sm:text-2xl font-bold">Everything you need in one place</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((o) => (
              <Link key={o.title} href={o.href} className="group flex gap-4 p-5 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all">
                <div className="w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 transition-colors overflow-hidden">
                  <img src={o.img} alt="" aria-hidden className="h-7 w-7 object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">{o.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{o.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
