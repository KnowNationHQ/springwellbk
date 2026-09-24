"use client";

import { useEffect } from "react";

const SMARTSUPP_KEY = process.env.NEXT_PUBLIC_SMARTSUPP_KEY || "222e75a5a32a4becf57f4c7222d71f616c9e313a";

export function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (document.getElementById("smartsupp-loader")) return;

    function loadSmartsupp() {
      if (document.getElementById("smartsupp-loader")) return;
      (window as any)._smartsupp = (window as any)._smartsupp || {};
      (window as any)._smartsupp.key = SMARTSUPP_KEY;
      (window as any).smartsupp||(function(d: Document) {
        var s: HTMLScriptElement, c: HTMLScriptElement, o: any = (window as any).smartsupp = function() { o._.push(arguments) }; o._ = [];
        s = d.getElementsByTagName("script")[0] as HTMLScriptElement;
        c = d.createElement("script");
        c.type = "text/javascript"; c.charset = "utf-8"; c.async = true;
        c.src = "https://www.smartsuppchat.com/loader.js?"; s.parentNode!.insertBefore(c, s);
      })(document);
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
