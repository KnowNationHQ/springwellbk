import type { Metadata } from "next";
import Script from "next/script";
import { ConvexClientProvider } from "@/components/convex-provider";
import { LocaleProvider } from "@/lib/i18n";
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
      <body className="antialiased min-h-screen flex flex-col">
        <ConvexClientProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ConvexClientProvider>
        <Script id="smartsupp" strategy="afterInteractive">
          {`var _smartsupp = _smartsupp || {};
_smartsupp.key = 'e83d93296f556f603cf7296ac95c29eb37a780cb';
window.smartsupp||(function(d) {
  var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
  s=d.getElementsByTagName('script')[0];c=d.createElement('script');
  c.type='text/javascript';c.charset='utf-8';c.async=true;
  c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
})(document);`}
        </Script>
      </body>
    </html>
  );
}
