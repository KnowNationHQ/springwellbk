"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-x-0 top-4 z-[100] flex justify-center px-4 transition-all duration-300 sm:justify-end sm:px-6">
      <div className={`transition-all duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"} flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-xl px-4 py-3 w-full max-w-[400px]`}>
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
        <p className="text-sm font-medium text-gray-800 m-0 flex-1">{message}</p>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
