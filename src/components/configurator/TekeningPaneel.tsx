"use client";

/**
 * Toont de hoofdtekening met de verplichte detailtekeningen (regel 5).
 * De details zijn niet uit te zetten — alleen in of uit te klappen.
 */
import { useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { genereerTekeningen } from "@/configurator/engine/tekening";
import { downloadTekening } from "@/configurator/svgExport";
import type { Berekening } from "@/configurator/types";

export function TekeningPaneel({ berekening }: { berekening: Berekening }) {
  const tekeningen = useMemo(() => genereerTekeningen(berekening), [berekening]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [hoofd, ...details] = tekeningen;

  // De swatches zitten als verwijzing in de tekening; bij download worden ze
  // meegebakken zodat het bestand ook buiten de site klopt.
  const download = (naam: string, svg: string) => {
    void downloadTekening(naam, svg);
  };

  return (
    <section className="rounded-xl border border-sand bg-paper p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-ink">Technische tekening</h3>
          <p className="text-xs text-ink-soft">{hoofd.omschrijving}</p>
        </div>
        <button
          type="button"
          onClick={() => download(hoofd.titel, hoofd.svg)}
          className="shrink-0 rounded-full border border-sand p-2 text-ink-soft transition hover:border-ink-soft hover:text-ink"
          aria-label="Hoofdtekening downloaden"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      <div
        className="overflow-hidden rounded-lg border border-sand bg-white"
        // De SVG komt uit onze eigen tekeningenengine; alle gebruikersinvoer
        // wordt daar via esc() ontsmet voordat hij in de tekening belandt.
        dangerouslySetInnerHTML={{ __html: hoofd.svg }}
      />

      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        aria-expanded={detailsOpen}
        className="mt-3 flex w-full items-center justify-between rounded-lg bg-rebu-cream px-3 py-2 text-sm text-ink transition hover:bg-sand"
      >
        <span>
          {details.length} verplichte detailtekeningen
          <span className="ml-2 text-xs text-ink-soft">
            ({details.map((d) => d.id).join(", ")})
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 transition ${detailsOpen ? "rotate-180" : ""}`} />
      </button>

      {detailsOpen && (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-ink-soft">
            Deze details worden automatisch bij elke tekening meegeleverd. Ze zijn onderdeel van de
            offerte én van de fabrieksorder.
          </p>
          {details.map((detail) => (
            <div key={detail.id} className="rounded-lg border border-sand p-3">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{detail.titel}</p>
                  <p className="text-xs text-ink-soft">{detail.omschrijving}</p>
                  <p className="text-[11px] text-rebu-green">{detail.wanneerVerplicht}</p>
                </div>
                <button
                  type="button"
                  onClick={() => download(detail.titel, detail.svg)}
                  className="shrink-0 rounded-full border border-sand p-1.5 text-ink-soft transition hover:border-ink-soft hover:text-ink"
                  aria-label={`${detail.titel} downloaden`}
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
              <div
                className="overflow-hidden rounded bg-white"
                dangerouslySetInnerHTML={{ __html: detail.svg }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
