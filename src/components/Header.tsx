"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { nav, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink/10 bg-rebu-cream/90 backdrop-blur-xl"
          : "border-b border-transparent bg-rebu-cream/70 backdrop-blur"
      }`}
    >
      <div className="container-rebu flex items-center justify-between py-3">
        <Link href="/" className="flex items-center" aria-label={site.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-dark.svg" alt={site.name} className="h-11 w-auto sm:h-12 md:h-14" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[0.82rem] font-medium tracking-wide transition-colors ${
                  active ? "text-rebu-green" : "text-ink/80 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 whitespace-nowrap text-[0.82rem] font-medium text-ink/80 transition-colors hover:text-ink xl:inline-flex"
          >
            <Phone className="h-4 w-4 flex-none text-rebu-green" />
            {site.phone}
          </a>
          <Link href="/offerte" className="hidden btn-primary md:inline-flex">
            Offerte aanvragen <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-rebu-green lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-rebu-cream lg:hidden">
          <div className="container-rebu flex flex-col py-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/10 py-3.5 text-base font-medium text-ink hover:text-rebu-green"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/offerte" onClick={() => setOpen(false)} className="mt-5 btn-primary w-full">
              Offerte aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={site.phoneHref}
              className="mt-3 inline-flex items-center justify-center gap-2 py-3 text-sm font-medium text-ink"
            >
              <Phone className="h-4 w-4 text-rebu-green" />
              {site.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
