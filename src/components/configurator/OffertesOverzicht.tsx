"use client";

/**
 * Het dashboard: alles wat er ooit is opgeslagen, terug te vinden en te openen.
 *
 * Elke opslag maakt een nieuwe versie; hier zie je per offerte de laatste. Op
 * 'Openen' laadt de configurator die offerte weer in, zodat je verder kunt
 * werken — opslaan maakt dan opnieuw een versie en de oude blijft bewaard.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, PencilRuler, Receipt, Search, Lock } from "lucide-react";
import { euroTekst } from "@/configurator/engine/prijs";
import type { Klant, Offerteregel } from "@/configurator/opslag/repository";

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

export function OffertesOverzicht() {
  const [offertes, setOffertes] = useState<Offerteregel[] | null>(null);
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [zoek, setZoek] = useState("");
  const [fout, setFout] = useState<string | null>(null);

  const laden = useCallback(async () => {
    try {
      const [o, k] = await Promise.all([
        fetch("/api/configurator/offertes").then((r) => r.json()),
        fetch("/api/configurator/klanten").then((r) => r.json()),
      ]);
      setOffertes(o.offertes ?? []);
      setKlanten(k.klanten ?? []);
    } catch {
      setFout("Kon de offertes niet ophalen.");
      setOffertes([]);
    }
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  /** Een andere klant aan een offerte hangen; naam en adres gaan mee. */
  const koppel = async (projectId: string, klantId: string) => {
    await fetch("/api/configurator/offertes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projectId, klantId: klantId || null }),
    });
    await laden();
  };

  const zichtbaar = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    if (!term) return offertes ?? [];
    return (offertes ?? []).filter((o) =>
      [o.project.naam, o.project.klantnaam, o.project.projectadres]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [offertes, zoek]);

  const totaal = zichtbaar.reduce((som, o) => som + o.totaalInclBtw, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Offertes</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Alles wat u heeft opgeslagen. Open een offerte om er verder aan te werken — de vorige
            versie blijft altijd bewaard.
          </p>
        </div>
        <Link
          href="/configurator"
          className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark"
        >
          <PencilRuler className="h-4 w-4" />
          Nieuwe offerte tekenen
        </Link>
      </div>

      {fout && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</p>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op klant, adres of naam"
            className="w-72 rounded-full border border-sand bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-rebu-green"
          />
        </div>
        {zichtbaar.length > 0 && (
          <span className="text-xs text-ink-soft">
            {zichtbaar.length} offertes · samen {euroTekst(totaal)} incl. btw
          </span>
        )}
      </div>

      {offertes === null ? (
        <p className="flex items-center gap-2 py-10 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Offertes worden opgehaald…
        </p>
      ) : zichtbaar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand p-10 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-ink-soft" />
          <p className="font-medium text-ink">
            {offertes.length === 0 ? "Nog geen offertes opgeslagen" : "Geen offerte gevonden"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {offertes.length === 0
              ? "Teken een kozijn en sla het op; het verschijnt hier automatisch."
              : "Pas uw zoekopdracht aan."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {zichtbaar.map((regel) => (
            <li key={regel.project.id} className="rounded-xl border border-sand bg-paper p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    {regel.project.klantnaam || regel.project.naam}
                  </p>
                  <p className="text-xs text-ink-soft">
                    {regel.aantalKozijnen} {regel.aantalKozijnen === 1 ? "kozijn" : "kozijnen"} · versie{" "}
                    {regel.laatsteVersie} · laatst gewijzigd {datum(regel.laatstGewijzigd)}
                  </p>
                  {regel.project.projectadres && (
                    <p className="text-xs text-ink-soft">{regel.project.projectadres}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-ink">{euroTekst(regel.totaalInclBtw)}</p>
                  <p className="text-[11px] text-ink-soft">incl. btw</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-sand pt-3">
                <label className="flex items-center gap-2 text-xs text-ink-soft">
                  Klant
                  <select
                    value={regel.project.klantId ?? ""}
                    onChange={(e) => koppel(regel.project.id, e.target.value)}
                    className="rounded-lg border border-sand px-2 py-1.5 text-xs text-ink outline-none focus:border-rebu-green"
                  >
                    <option value="">Geen klant gekoppeld</option>
                    {klanten.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.naam}
                      </option>
                    ))}
                  </select>
                </label>

                <Link
                  href={`/configurator?offerte=${regel.project.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink px-3 py-1.5 text-xs text-ink transition hover:bg-ink hover:text-paper"
                >
                  <PencilRuler className="h-3.5 w-3.5" />
                  Openen en aanpassen
                </Link>
                <a
                  href={`/api/configurator/document?project=${regel.project.id}&soort=offerte`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Offerte
                </a>
                <a
                  href={`/api/configurator/document?project=${regel.project.id}&soort=factuur`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Onze factuur
                </a>
                <a
                  href={`/api/configurator/document?project=${regel.project.id}&soort=fabrieksorder`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Fabrieksorder
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
