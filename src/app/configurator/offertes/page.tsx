import type { Metadata } from "next";
import { OffertesOverzicht } from "@/components/configurator/OffertesOverzicht";

export const metadata: Metadata = {
  title: "Offertes — Kozijnconfigurator",
  robots: { index: false, follow: false },
};

export default function OffertesPagina() {
  return <OffertesOverzicht />;
}
