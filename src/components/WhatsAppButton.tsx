"use client";

import { MessageCircle } from "lucide-react";
import { site } from "@/lib/site";

export function WhatsAppButton() {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-110 hover:shadow-[0_6px_30px_rgba(37,211,102,0.6)] md:h-16 md:w-16"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
    </a>
  );
}
