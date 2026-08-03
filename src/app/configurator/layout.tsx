/**
 * De werkomgeving rondom de configurator.
 *
 * Dit is geen pagina van de website maar een applicatie: geen sitemenu, geen
 * marketingkoptekst, wel een smalle balk met de drie plekken waar je heen wilt —
 * tekenen, je offertes en je klanten.
 */
import Link from "next/link";
import { Werkbalk } from "@/components/configurator/Werkbalk";

export default function ConfiguratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-rebu-cream">
      <header className="sticky top-0 z-40 border-b border-sand bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center gap-6 px-4 py-2.5 sm:px-6 lg:px-8">
          <Link href="/configurator" className="flex items-baseline gap-2">
            <span className="font-display text-lg leading-none text-ink">Kozijnconfigurator</span>
            <span className="hidden text-[11px] uppercase tracking-editorial text-ink-soft sm:inline">
              Kunststofkozijnnodig.nl
            </span>
          </Link>
          <Werkbalk />
          <Link
            href="/"
            className="ml-auto text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Terug naar de website
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
