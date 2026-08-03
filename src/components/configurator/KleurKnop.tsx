"use client";

/**
 * Een kleur kiezen zonder dat de hele catalogus in het scherm staat.
 *
 * In de bovenbalk staat per zijde één knop met de daadwerkelijke folie erop.
 * Pas als je erop klikt komt de catalogus in beeld, als venster over de
 * tekening heen. Dat houdt de vaste gegevens compact en maakt tegelijk in één
 * oogopslag zichtbaar wélke kleur waar zit — kozijn en vleugel, binnen en
 * buiten, alle vier los te kiezen.
 */
import { useEffect } from "react";
import { X } from "lucide-react";
import { kleurOpId, oppervlakTekst } from "@/configurator/data/kleuren";
import { KleurSelector } from "./KleurSelector";
import type { MerkId } from "@/configurator/types";

/** Het vlakje met de folie zelf — de swatch, niet een benadering in hex. */
export function Kleurvlak({ kleurId, groot }: { kleurId: string | null; groot?: boolean }) {
  const kleur = kleurOpId(kleurId);
  const maat = groot ? "h-9 w-9" : "h-6 w-6";
  return (
    <span
      className={`${maat} shrink-0 rounded-md border border-ink/15 bg-cover bg-center`}
      style={
        kleur?.swatch
          ? { backgroundImage: `url(${kleur.swatch})` }
          : { backgroundColor: kleur?.hex ?? "#e7e4dc" }
      }
    />
  );
}

interface KnopProps {
  label: string;
  /** De gekozen kleur; `null` betekent: volgt een andere keuze. */
  kleurId: string | null;
  /** Waar de kleur vandaan komt als er niets eigens gekozen is. */
  erftVan?: { label: string; kleurId: string } | null;
  onOpen: () => void;
}

export function KleurKnop({ label, kleurId, erftVan, onOpen }: KnopProps) {
  const effectief = kleurId ?? erftVan?.kleurId ?? null;
  const kleur = kleurOpId(effectief);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-sand bg-paper px-3 py-2 text-left transition hover:border-ink-soft hover:shadow-soft"
    >
      <Kleurvlak kleurId={effectief} groot />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] uppercase tracking-editorial text-ink-soft">{label}</span>
        <span className="block truncate text-sm text-ink">
          {kleur ? `${kleur.code} · ${kleur.naam}` : "Kies een kleur"}
        </span>
        {kleurId === null && erftVan && (
          <span className="block truncate text-[11px] text-ink-soft">
            gelijk aan {erftVan.label.toLowerCase()}
          </span>
        )}
      </span>
    </button>
  );
}

interface PopupProps {
  open: boolean;
  titel: string;
  merk: MerkId;
  kleurId: string | null;
  /** Aanwezig bij de vleugel: dan mag 'gelijk aan het kozijn' gekozen worden. */
  erftVan?: { label: string; kleurId: string } | null;
  onKies: (kleurId: string | null) => void;
  onSluiten: () => void;
}

export function KleurPopup({ open, titel, merk, kleurId, erftVan, onKies, onSluiten }: PopupProps) {
  // Escape sluit het venster — sneller dan naar het kruisje bewegen.
  useEffect(() => {
    if (!open) return;
    const opToets = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSluiten();
    };
    window.addEventListener("keydown", opToets);
    return () => window.removeEventListener("keydown", opToets);
  }, [open, onSluiten]);

  if (!open) return null;
  const effectief = kleurId ?? erftVan?.kleurId ?? "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onSluiten}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-paper shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sand px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Kleurvlak kleurId={effectief} groot />
            <h2 className="font-display text-xl text-ink">{titel}</h2>
          </div>
          <button
            type="button"
            onClick={onSluiten}
            className="rounded-full p-1.5 text-ink-soft transition hover:bg-sand hover:text-ink"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {erftVan && (
            <button
              type="button"
              onClick={() => {
                onKies(null);
                onSluiten();
              }}
              aria-pressed={kleurId === null}
              className={`mb-4 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                kleurId === null
                  ? "border-rebu-green bg-rebu-tint ring-1 ring-rebu-green"
                  : "border-sand hover:border-ink-soft"
              }`}
            >
              <Kleurvlak kleurId={erftVan.kleurId} groot />
              <span>
                <span className="block text-sm font-medium text-ink">
                  Gelijk aan {erftVan.label.toLowerCase()}
                </span>
                <span className="block text-xs text-ink-soft">
                  {kleurOpId(erftVan.kleurId)
                    ? `${kleurOpId(erftVan.kleurId)!.naam} · ${oppervlakTekst(kleurOpId(erftVan.kleurId)!)}`
                    : "—"}
                  {" — verandert vanzelf mee"}
                </span>
              </span>
            </button>
          )}

          <KleurSelector
            merk={merk}
            waarde={kleurId ?? ""}
            onKies={(id) => {
              onKies(id);
              onSluiten();
            }}
            label="Kies uit de catalogus"
          />
        </div>
      </div>
    </div>
  );
}
