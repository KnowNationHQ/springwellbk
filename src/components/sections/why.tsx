import { Quote } from "lucide-react";
import { T } from "@/lib/i18n";

export function WhyBankSection() {
  return (
    <section className="bg-green-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-medium text-green-600"><T k="why.eyebrow" /></p>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl"><T k="why.heading" /></h2>
        </div>
        <div className="grid gap-10 lg:grid-cols-2">
          <figure className="flex flex-col rounded-2xl bg-white p-8 shadow-sm">
            <Quote className="h-8 w-8 text-green-500" />
            <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-gray-700">
              <T k="why.quote" />
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-green-700">
              <T k="why.quoteName" />
            </figcaption>
          </figure>
          <div className="space-y-6">
            <Blurb titleKey="why.convenient.title" descKey="why.convenient.desc" />
            <Blurb titleKey="why.hours.title" descKey="why.hours.desc" noteKey="why.hours.note" />
            <Blurb titleKey="why.security.title" descKey="why.security.desc" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Blurb({ titleKey, descKey, noteKey }: { titleKey: string; descKey: string; noteKey?: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-bold text-gray-900"><T k={titleKey} /></h3>
      <p className="text-sm leading-relaxed text-gray-600"><T k={descKey} /></p>
      {noteKey && <p className="mt-1 text-xs text-gray-400"><T k={noteKey} /></p>}
    </div>
  );
}
