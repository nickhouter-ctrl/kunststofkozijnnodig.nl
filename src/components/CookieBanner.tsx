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
      <div className="mx-auto max-w-4xl border border-white/10 bg-rebu-green-dark p-6 sm:flex sm:items-center sm:gap-6 sm:p-8">
        <div className="flex-1 text-sm leading-relaxed text-white/80">
          <p className="font-display text-base font-medium text-white">Wij gebruiken cookies 🍪</p>
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
            className="border border-white/40 bg-transparent px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/10"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={() => accept("all")}
            className="border border-white bg-white px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-rebu-green-dark transition-colors hover:bg-transparent hover:text-white"
          >
            Accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
