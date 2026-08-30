import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Start Banking Smarter?</h2>
        <p className="text-green-200 text-sm sm:text-base mb-6 max-w-lg mx-auto">
          Join thousands of customers who trust SpringWell for their daily banking needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="bg-white text-green-800 hover:bg-green-100">
            <Link href="/register">
              Open Free Account <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
