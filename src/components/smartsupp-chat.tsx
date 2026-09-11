"use client";

import { useEffect } from "react";

export function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("smartsupp-loader")) return;

    const key = process.env.NEXT_PUBLIC_SMARTSUPP_KEY;
    if (!key) return;

    (window as any)._smartsupp = (window as any)._smartsupp || {};
    (window as any)._smartsupp.key = key;

    (window as any).smartsupp = (window as any).smartsupp || function (...args: any[]) {
      ((window as any).smartsupp._ = (window as any).smartsupp._ || []).push(args);
    };
    (window as any).smartsupp._ = (window as any).smartsupp._ || [];

    const s = document.createElement("script");
    s.id = "smartsupp-loader";
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://www.smartsuppchat.com/loader.js";
    document.head.appendChild(s);
  }, []);

  return null;
}
