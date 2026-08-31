import Link from "next/link";
import { ArrowRight } from "lucide-react";

const promos = [
  {
    eyebrow: "GET $125",
    title: "with SpringWell Checking",
    desc: "Open a checking account today and earn a $125 bonus with qualifying direct deposits.",
    cta: "Open Account",
    href: "/register",
    bg: "from-green-700 to-green-900",
    img: "/images/promo-checking.svg",
  },
  {
    eyebrow: "START EXPANDING",
    title: "Grow your business",
    desc: "Explore how your business can grow with tailored accounts and cash-flow tools.",
    cta: "Business Banking",
    href: "/register",
    bg: "from-green-600 to-green-800",
    img: "/images/promo-business.svg",
  },
  {
    eyebrow: "START OWNING",
    title: "Strive for your dream home",
    desc: "Competitive mortgage rates and a guided path from pre-approval to closing.",
    cta: "Learn More",
    href: "/loan",
    bg: "from-green-700 to-green-900",
    img: "/images/promo-home.svg",
  },
  {
    eyebrow: "GET MONEY SMART",
    title: "Build for tomorrow",
    desc: "It's never too early to start building for tomorrow with our savings tools.",
    cta: "Start Saving",
    href: "/register",
    bg: "from-green-600 to-green-800",
    img: "/images/promo-savings.svg",
  },
];

export function PromosSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-green-600 text-sm font-medium mb-2">Offers</p>
          <h2 className="text-2xl sm:text-3xl font-bold">Banking built around your goals</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promos.map((p) => (
            <div key={p.title} className={`rounded-2xl overflow-hidden text-white bg-gradient-to-br ${p.bg} flex flex-col`}>
              <img src={p.img} alt="" aria-hidden className="w-full h-36 object-cover" />
              <div className="p-6 flex flex-col flex-1">
              <p className="text-xs font-semibold tracking-wide opacity-80 mb-2">{p.eyebrow}</p>
              <h3 className="font-bold text-lg mb-2 leading-snug">{p.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-4 flex-1">{p.desc}</p>
              <Link href={p.href} className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all">
                {p.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
