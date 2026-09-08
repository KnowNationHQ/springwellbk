"use client";

import Image from "next/image";

export function LogoSpinner({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="logo-loading">
        <Image
          src="/logo.svg"
          alt="SpringWell Bank"
          width={size}
          height={size}
          priority
        />
      </div>
    </div>
  );
}
