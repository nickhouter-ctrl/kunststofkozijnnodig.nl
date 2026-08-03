"use client";

/**
 * Pop-up validatie (regel 3 uit hoofdstuk 1).
 *
 * Verschijnt direct zodra een maat of combinatie niet produceerbaar is — niet
 * pas bij opslaan. Toont altijd uitleg in gewone taal én het dichtstbijzijnde
 * haalbare alternatief. Een harde blokkade kan alleen weggeklikt worden om
 * terug te gaan; een waarschuwing kan bewust bevestigd worden.
 */
import { AlertTriangle, ArrowRight, PhoneCall, X } from "lucide-react";
import type { Bevinding } from "@/configurator/types";

const STIJL = {
  blokkade: {
    rand: "border-red-300",
    vlak: "bg-red-50",
    tekst: "text-red-800",
    kop: "Dit kan zo niet geproduceerd worden",
  },
  waarschuwing: {
    rand: "border-amber-300",
    vlak: "bg-amber-50",
    tekst: "text-amber-900",
    kop: "Let op",
  },
  escalatie: {
    rand: "border-sky-300",
    vlak: "bg-sky-50",
    tekst: "text-sky-900",
    kop: "Even samen naar kijken",
  },
} as const;

export function BevindingRegel({ bevinding }: { bevinding: Bevinding }) {
  const stijl = STIJL[bevinding.type];
  return (
    <div className={`rounded-lg border ${stijl.rand} ${stijl.vlak} p-4`}>
      <p className={`font-semibold ${stijl.tekst}`}>{bevinding.kop}</p>
      <p className="mt-1 text-sm text-ink-soft">{bevinding.uitleg}</p>
      {bevinding.alternatief && (
        <p className="mt-2 flex items-start gap-2 text-sm font-medium text-ink">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-rebu-green" />
          {bevinding.alternatief}
        </p>
      )}
    </div>
  );
}

interface Props {
  bevindingen: Bevinding[];
  open: boolean;
  onSluiten: () => void;
  onNaarStap: (stap: number) => void;
  onEscaleren: () => void;
}

export function BevindingenPopup({ bevindingen, open, onSluiten, onNaarStap, onEscaleren }: Props) {
  if (!open || bevindingen.length === 0) return null;

  const blokkades = bevindingen.filter((b) => b.type === "blokkade");
  const escalaties = bevindingen.filter((b) => b.type === "escalatie");
  const zwaarste = blokkades[0] ?? escalaties[0] ?? bevindingen[0];
  const stijl = STIJL[zwaarste.type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bevinding-kop"
    >
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper shadow-soft">
        <div className={`flex items-start gap-3 border-b ${stijl.rand} ${stijl.vlak} p-5`}>
          <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${stijl.tekst}`} />
          <div className="flex-1">
            <h2 id="bevinding-kop" className={`font-display text-xl ${stijl.tekst}`}>
              {stijl.kop}
            </h2>
            <p className="text-sm text-ink-soft">
              {bevindingen.length === 1
                ? "Er is één punt dat aandacht nodig heeft."
                : `Er zijn ${bevindingen.length} punten die aandacht nodig hebben.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onSluiten}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-paper hover:text-ink"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          {bevindingen.map((bevinding, i) => (
            <div key={`${bevinding.regelId}-${i}`}>
              <BevindingRegel bevinding={bevinding} />
              {bevinding.type !== "escalatie" && (
                <button
                  type="button"
                  onClick={() => {
                    onNaarStap(bevinding.stap);
                    onSluiten();
                  }}
                  className="mt-2 text-sm font-medium text-rebu-green underline underline-offset-4 hover:text-rebu-green-dark"
                >
                  Naar stap {bevinding.stap} om dit aan te passen
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand p-5">
          {/* Regel 4: nooit een doodlopende foutmelding — altijd een mens bereikbaar. */}
          <button
            type="button"
            onClick={onEscaleren}
            className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
          >
            <PhoneCall className="h-4 w-4" />
            Neem contact op met Rebu
          </button>
          <button
            type="button"
            onClick={onSluiten}
            className="rounded-full bg-rebu-green px-5 py-2 text-sm font-medium text-paper transition hover:bg-rebu-green-dark"
          >
            Ik pas het aan
          </button>
        </div>
      </div>
    </div>
  );
}
