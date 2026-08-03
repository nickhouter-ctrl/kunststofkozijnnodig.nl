import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfiguratorApp } from "@/components/configurator/ConfiguratorApp";

export const metadata: Metadata = {
  title: "Kozijnconfigurator",
  description:
    "Stel zelf uw kunststof kozijn samen: profiel, maten, indeling, kleur, glas en beslag — met glasmaat, cilindermaat en hormaat altijd berekend.",
  robots: { index: false, follow: false },
};

export default function ConfiguratorPagina() {
  return (
    // De app leest een eventuele offerte-id uit de zoekopdracht; dat hoort in
    // Next achter een Suspense-grens te staan.
    <Suspense fallback={<p className="p-8 text-sm text-ink-soft">Configurator wordt geladen…</p>}>
      <ConfiguratorApp startContext="aannemer" />
    </Suspense>
  );
}
