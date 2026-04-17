"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so the banner slides in after page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept(level: "all" | "necessary") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6"
      style={{ animation: "slideUp 0.5s ease-out" }}
    >
      <div className="mx-auto max-w-4xl rounded-2xl bg-rebu-green-dark p-6 shadow-glow ring-1 ring-white/10 sm:flex sm:items-center sm:gap-6 sm:p-8">
        <div className="flex-1 text-sm leading-relaxed text-white/90">
          <p className="font-semibold text-white">Wij gebruiken cookies 🍪</p>
          <p className="mt-1">
            Kunststofkozijnnodig.nl gebruikt cookies voor een optimale website-ervaring en om ons
            verkeer te analyseren. Lees meer in onze{" "}
            <a
              href="/privacyverklaring"
              className="underline underline-offset-2 hover:text-white"
            >
              privacyverklaring
            </a>
            .
          </p>
        </div>

        <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
          <button
            onClick={() => accept("necessary")}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={() => accept("all")}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rebu-green-dark shadow-soft transition-all hover:bg-rebu-cream"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
