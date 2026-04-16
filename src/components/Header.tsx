"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { nav, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-rebu-green-dark/80 shadow-lg backdrop-blur-xl ring-1 ring-white/10"
          : "bg-rebu-green-dark/65 backdrop-blur-lg"
      }`}
    >
      <div className="container-rebu flex items-center justify-between py-3 md:py-4">
        <Link href="/" className="flex items-center gap-3" aria-label={site.name}>
          <Image
            src="/logos/logo-white.svg"
            alt={site.name}
            width={140}
            height={44}
            className="h-10 w-auto md:h-11"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 md:inline-flex"
          >
            <Phone className="h-4 w-4 flex-none text-rebu-cream" />
            <span className="whitespace-nowrap">{site.phone}</span>
          </a>
          <Link
            href="/offerte"
            className="hidden items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rebu-green-dark shadow-md transition-all hover:bg-rebu-cream hover:shadow-lg md:inline-flex"
          >
            Offerte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-rebu-green-dark/98 backdrop-blur-xl lg:hidden">
          <div className="container-rebu flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-white hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/offerte"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rebu-green-dark"
            >
              Offerte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" />
              {site.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
