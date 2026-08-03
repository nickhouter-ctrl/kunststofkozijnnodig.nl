import type { Metadata } from "next";
import { KlantenBeheer } from "@/components/configurator/KlantenBeheer";

export const metadata: Metadata = {
  title: "Klanten — Kozijnconfigurator",
  robots: { index: false, follow: false },
};

export default function KlantenPagina() {
  return <KlantenBeheer />;
}
