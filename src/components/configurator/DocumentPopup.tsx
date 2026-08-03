"use client";

/**
 * De documenten nakijken vóór ze de deur uit gaan.
 *
 * Een offerte of fabrieksorder wordt niet blind gedownload: je wilt kunnen
 * lezen wat er staat. Dit venster haalt exact hetzelfde document op als de
 * downloadknop — dezelfde route, dezelfde snapshot — en toont het in een
 * afgeschermde iframe. Wat je hier ziet is dus letterlijk wat de klant krijgt.
 *
 * Bij meerdere kozijnen in de order krijgt elk kozijn zijn eigen document; je
 * wisselt er met de tabs bovenin doorheen.
 */
import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Printer, X } from "lucide-react";

export type DocumentSoort = "offerte" | "factuur" | "fabrieksorder";

export const DOCUMENT_TITEL: Record<DocumentSoort, string> = {
  offerte: "Offerte voor uw klant",
  factuur: "Onze factuur aan u",
  fabrieksorder: "Fabrieksorder",
};

const DOCUMENT_UITLEG: Record<DocumentSoort, string> = {
  offerte: "Zonder onze logo's en zonder inkoopprijs — dit stuurt u door aan uw klant.",
  factuur: "Wat u aan ons betaalt. Het verschil met de offerte is uw eigen marge.",
  fabrieksorder: "Met inkoopprijs en productiegegevens. Alleen voor Rebu-productie.",
};

export interface Opgeslagen {
  naam: string;
  snapshotId: string;
  versie: number;
}

interface Props {
  soort: DocumentSoort | null;
  elementen: Opgeslagen[];
  onSluiten: () => void;
}

export function DocumentPopup({ soort, elementen, onSluiten }: Props) {
  const [index, setIndex] = useState(0);
  const [html, setHtml] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  const huidig = elementen[index];
  const url = soort && huidig ? `/api/configurator/document?snapshot=${huidig.snapshotId}&soort=${soort}` : null;

  useEffect(() => {
    if (!soort) return;
    setIndex(0);
  }, [soort]);

  useEffect(() => {
    if (!url) return;
    let afgebroken = false;
    setHtml(null);
    setFout(null);
    fetch(url)
      .then(async (antwoord) => {
        const tekst = await antwoord.text();
        if (afgebroken) return;
        if (!antwoord.ok) {
          setFout("Dit document kon niet worden opgehaald.");
          return;
        }
        setHtml(tekst);
      })
      .catch(() => {
        if (!afgebroken) setFout("Kon de server niet bereiken.");
      });
    return () => {
      afgebroken = true;
    };
  }, [url]);

  useEffect(() => {
    if (!soort) return;
    const opToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSluiten();
    };
    window.addEventListener("keydown", opToets);
    return () => window.removeEventListener("keydown", opToets);
  }, [soort, onSluiten]);

  if (!soort) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={onSluiten}
    >
      <div
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-paper shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-sand px-5 py-3.5">
          <div>
            <h2 className="font-display text-xl text-ink">{DOCUMENT_TITEL[soort]}</h2>
            <p className="text-xs text-ink-soft">{DOCUMENT_UITLEG[soort]}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink transition hover:border-ink-soft"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Nieuw tabblad
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                // Afdrukken doet de iframe zelf; dan blijft de opmaak intact.
                const frame = document.getElementById("documentweergave") as HTMLIFrameElement | null;
                frame?.contentWindow?.print();
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-xs text-ink transition hover:border-ink-soft"
            >
              <Printer className="h-3.5 w-3.5" />
              Afdrukken / pdf
            </button>
            <button
              type="button"
              onClick={onSluiten}
              className="rounded-full p-1.5 text-ink-soft transition hover:bg-sand hover:text-ink"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {elementen.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-sand px-5 py-2">
            {elementen.map((el, i) => (
              <button
                key={el.snapshotId}
                type="button"
                onClick={() => setIndex(i)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs transition ${
                  i === index ? "bg-ink text-paper" : "border border-sand text-ink-soft hover:border-ink-soft"
                }`}
              >
                {el.naam}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-hidden bg-rebu-cream">
          {fout ? (
            <p className="p-6 text-sm text-red-700">{fout}</p>
          ) : html === null ? (
            <p className="flex h-full items-center justify-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Document wordt opgehaald…
            </p>
          ) : (
            <iframe
              id="documentweergave"
              title={DOCUMENT_TITEL[soort]}
              srcDoc={html}
              // Het document komt van onze eigen route, maar draait in een
              // afgeschermde iframe: het hoeft niets te kunnen behalve zichzelf tonen.
              sandbox="allow-same-origin allow-modals"
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
