"use client";

/**
 * De schil van de website: koptekst, voettekst en de zwevende knoppen.
 *
 * De configurator is geen webpagina met een menu erboven maar een werkomgeving:
 * daar wil je het volle scherm voor de tekening, zonder navigatie van de site
 * eromheen. Alles onder /configurator krijgt daarom zijn eigen schil (zie
 * src/app/configurator/layout.tsx) en slaat deze over.
 *
 * De voettekst is een servercomponent en wordt daarom als prop doorgegeven in
 * plaats van hier geïmporteerd.
 */
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieBanner } from "@/components/CookieBanner";

export function SiteChrome({
  children,
  voettekst,
}: {
  children: React.ReactNode;
  voettekst: React.ReactNode;
}) {
  const pad = usePathname();
  const isWerkomgeving = pad?.startsWith("/configurator") ?? false;

  if (isWerkomgeving) return <>{children}</>;

  return (
    <>
      <Header />
      <main>{children}</main>
      {voettekst}
      <WhatsAppButton />
      <CookieBanner />
    </>
  );
}
