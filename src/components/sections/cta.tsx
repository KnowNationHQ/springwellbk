import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { T } from "@/lib/i18n";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3"><T k="cta.heading" /></h2>
        <p className="text-green-200 text-sm sm:text-base mb-6 max-w-lg mx-auto">
          <T k="cta.body" />
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-white text-green-800 hover:bg-green-100">
            <Link href="/register">
              <T k="cta.button" /> <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
