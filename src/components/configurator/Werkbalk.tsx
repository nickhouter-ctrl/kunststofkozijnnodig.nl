"use client";

/**
 * De navigatie binnen de werkomgeving. Drie plekken, meer heeft het niet nodig.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilRuler, FileText, Users } from "lucide-react";

const PLEKKEN = [
  { href: "/configurator", label: "Tekenen", icoon: PencilRuler },
  { href: "/configurator/offertes", label: "Offertes", icoon: FileText },
  { href: "/configurator/klanten", label: "Klanten", icoon: Users },
];

export function Werkbalk() {
  const pad = usePathname();

  return (
    <nav className="flex gap-1">
      {PLEKKEN.map(({ href, label, icoon: Icoon }) => {
        // '/configurator' is alleen actief op zichzelf, de rest ook op subpaden.
        const actief = href === "/configurator" ? pad === href : (pad?.startsWith(href) ?? false);
        return (
          <Link
            key={href}
            href={href}
            aria-current={actief ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
              actief ? "bg-ink text-paper" : "text-ink-soft hover:bg-sand hover:text-ink"
            }`}
          >
            <Icoon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
