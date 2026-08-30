import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpringWell Bank - Your Trusted Financial Partner",
  description: "SpringWell Bank makes it easy to manage daily transactions. Open an account today.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
