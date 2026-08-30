"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

const url = process.env.NEXT_PUBLIC_CONVEX_URL || "";

const defaultClient = url ? new ConvexReactClient(url) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!defaultClient) return <>{children}</>;

  return <ConvexProvider client={defaultClient}>{children}</ConvexProvider>;
}
