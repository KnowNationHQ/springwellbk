"use client";

import { useEffect } from "react";

export function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("smartsupp-loader")) return;

    function loadSmartsupp() {
      if (document.getElementById("smartsupp-loader")) return;
      (window as any)._smartsupp = (window as any)._smartsupp || {};
      (window as any)._smartsupp.key = "222e75a5a32a4becf57f4c7222d71f616c9e313a";
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
    }

    const events = ["scroll", "mousemove", "touchstart", "keydown"];
    function onInteraction() {
      events.forEach((e) => window.removeEventListener(e, onInteraction));
      loadSmartsupp();
    }
    events.forEach((e) => window.addEventListener(e, onInteraction, { passive: true, once: true }));
    const timer = setTimeout(loadSmartsupp, 8000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onInteraction));
      clearTimeout(timer);
    };
  }, []);

  return null;
}
