"use client";

import { useEffect } from "react";

export function SmartsuppChat() {
  useEffect(() => {
    if (typeof window === "undefined") return;
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
    s.charset = "utf-8";
    s.async = true;
    s.src = "//www.smartsuppchat.com/loader.js?";
    (document.head || document.body).appendChild(s);
  }, []);

  return null;
}
