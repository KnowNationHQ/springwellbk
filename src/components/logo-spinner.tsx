"use client";

export function LogoSpinner({ size }: { size?: number }) {
  if (size) {
    return (
      <span className="logo-loading inline-flex text-[11px] text-gray-400 font-medium">
        Loading...
      </span>
    );
  }
  return (
    <div className="logo-loading text-center">
      <p className="text-sm font-semibold text-[#426FB6] m-0">Springwell Bank</p>
      <p className="text-xs text-gray-400 m-0 mt-1">initializing...</p>
    </div>
  );
}
