"use client";

import Image from "next/image";

export function LogoSpinner({ size }: { size?: number }) {
  if (size) {
    const h = Math.round(size * 48 / 248);
    return (
      <div className="logo-loading inline-block">
        <Image src="/logo.svg" alt="" width={size} height={h} priority />
      </div>
    );
  }
  return (
    <div className="logo-loading mx-auto">
      <Image
        src="/logo.svg"
        alt="SpringWell Bank"
        width={320}
        height={62}
        priority
        style={{ display: "block", margin: "0 auto", width: "min(80vw, 320px)", height: "auto" }}
      />
    </div>
  );
}
