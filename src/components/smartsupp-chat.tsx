"use client";

import { useEffect } from "react";

export function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("smartsupp-loader")) return;

    (window as any).smartsupp = (window as any).smartsupp || function (...args: any[]) {
      ((window as any).smartsupp._ = (window as any).smartsupp._ || []).push(args);
    };
    (window as any).smartsupp._ = (window as any).smartsupp._ || [];

    const s = document.createElement("script");
    s.id = "smartsupp-loader";
    s.type = "text/javascript";
    s.charset = "utf-8";
    s.async = true;
    s.src = "https://www.smartsuppchat.com/loader.js?key=e83d93296f556f603cf7296ac95c29eb37a780cb";
    document.body.appendChild(s);
  }, []);

  return null;
}
