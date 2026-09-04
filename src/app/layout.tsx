import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-provider";
import { LocaleProvider } from "@/lib/i18n";
import { SmartsuppChat } from "@/components/smartsupp-chat";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpringWell Bank - Your Trusted Financial Partner",
  description: "SpringWell Bank makes it easy to manage daily transactions. Open an account today.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/images/hero.jpeg" fetchPriority="high" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ConvexClientProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ConvexClientProvider>
        <SmartsuppChat />
      </body>
    </html>
  );
}
