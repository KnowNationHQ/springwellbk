import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, PiggyBank, Building2, ArrowRight } from "lucide-react";

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
      </div>
    </section>
  );
}
