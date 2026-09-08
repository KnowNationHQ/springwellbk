"use client";

import Image from "next/image";

export function LogoSpinner({ size }: { size?: number }) {
  if (size) {
    const h = Math.round(size * 48 / 248);
    return (
      <span className="logo-loading inline-flex justify-center items-center">
        <Image src="/logo.svg" alt="" width={size} height={h} priority />
      </span>
    );
  }
  return (
    <div className="logo-loading w-full flex justify-center items-center">
      <Image
        src="/logo.svg"
        alt="SpringWell Bank"
        width={320}
        height={62}
        priority
        style={{ width: "min(80vw, 320px)", height: "auto" }}
      />
    </div>
  );
}
