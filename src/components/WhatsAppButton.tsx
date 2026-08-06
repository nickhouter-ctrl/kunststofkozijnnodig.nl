"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/** Officieel WhatsApp-glyph — herkenbaarder dan een algemeen chat-icoontje. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  // Kort uitgesteld tonen, zodat de knop na het laden het beeld in springt in
  // plaats van er meteen statisch te staan — dat is wat hem laat opvallen.
  const [zichtbaar, setZichtbaar] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setZichtbaar(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!zichtbaar) return null;

  return (
    <div className="group fixed bottom-6 right-6 z-50 flex animate-pop-in items-center gap-3">
      {/* Label schuift open bij hover; op mobiel blijft alleen de knop staan. */}
      <span className="pointer-events-none hidden max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-ink px-0 py-2.5 text-sm font-medium text-white opacity-0 shadow-soft transition-all duration-300 ease-out-soft group-hover:max-w-[14rem] group-hover:px-4 group-hover:opacity-100 md:block">
        Stuur ons een WhatsApp
      </span>

      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_24px_rgba(37,211,102,0.45)] transition-transform duration-300 ease-out-soft hover:scale-110 md:h-[4.5rem] md:w-[4.5rem]"
        aria-label="Stuur ons een WhatsApp-bericht"
      >
        {/* Pulserende ring — vraagt aandacht zonder de knop zelf te laten bewegen. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#25D366] motion-safe:animate-pulse-ring"
        />
        <WhatsAppGlyph className="relative h-8 w-8 md:h-9 md:w-9" />
      </a>
    </div>
  );
}
