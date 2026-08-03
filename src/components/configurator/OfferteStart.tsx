"use client";

/**
 * Het begin van een nieuwe offerte: voor wie is hij?
 *
 * De klant eerst kiezen scheelt later werk: naam en adres staan dan vanaf het
 * eerste kozijn aan de offerte gekoppeld en komen automatisch op elk document.
 * Staat de klant er nog niet tussen, dan maak je hem hier meteen aan zonder de
 * configurator te verlaten. Zonder klant verder gaan mag ook — dan koppel je
 * hem later in het offerteoverzicht.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Plus, Search, UserPlus, Users } from "lucide-react";

export interface KlantKeuze {
  id: string;
  naam: string;
  plaats?: string;
  adres?: string;
}

interface Props {
  klanten: KlantKeuze[];
  /** Wordt aangeroepen met de gekozen klant, of met null om zonder verder te gaan. */
  onKies: (klantId: string | null) => void;
  /** Een nieuwe klant is aangemaakt; de lijst hoort ververst te worden. */
  onNieuweKlant: (klant: KlantKeuze) => void;
}

export function OfferteStart({ klanten, onKies, onNieuweKlant }: Props) {
  const [zoek, setZoek] = useState("");
  const [nieuw, setNieuw] = useState<{ naam: string; plaats: string; adres: string } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const term = zoek.trim().toLowerCase();
  const zichtbaar = klanten.filter((k) =>
    term === "" ? true : `${k.naam} ${k.plaats ?? ""}`.toLowerCase().includes(term)
  );

  const maakAan = async () => {
    if (!nieuw || nieuw.naam.trim() === "") {
      setFout("Vul in ieder geval een naam in.");
      return;
    }
    setBezig(true);
    setFout(null);
    try {
      const antwoord = await fetch("/api/configurator/klanten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ naam: nieuw.naam, plaats: nieuw.plaats, adres: nieuw.adres }),
      });
      const data = await antwoord.json();
      if (!antwoord.ok) {
        setFout(data.fout ?? "Aanmaken is niet gelukt.");
        return;
      }
      onNieuweKlant(data.klant);
      onKies(data.klant.id);
    } catch {
      setFout("Kon de server niet bereiken.");
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] uppercase tracking-editorial text-ink-soft">Nieuwe offerte</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Voor welke klant is deze offerte?</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Kies de klant voordat u begint met tekenen. Alles wat u daarna opslaat hangt automatisch aan
        deze klant, en zijn naam en adres komen op de offerte te staan.
      </p>

      {fout && (
        <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</p>
      )}

      {nieuw ? (
        <div className="mt-6 rounded-2xl border border-rebu-green bg-paper p-5">
          <h2 className="mb-3 font-display text-xl text-ink">Nieuwe klant</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs text-ink-soft">Naam of bedrijfsnaam</span>
              <input
                autoFocus
                value={nieuw.naam}
                onChange={(e) => setNieuw({ ...nieuw, naam: e.target.value })}
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-soft">Adres</span>
              <input
                value={nieuw.adres}
                onChange={(e) => setNieuw({ ...nieuw, adres: e.target.value })}
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-soft">Plaats</span>
              <input
                value={nieuw.plaats}
                onChange={(e) => setNieuw({ ...nieuw, plaats: e.target.value })}
                className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={maakAan}
              disabled={bezig}
              className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark disabled:bg-sand disabled:text-ink-soft"
            >
              {bezig ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Aanmaken en beginnen
            </button>
            <button
              type="button"
              onClick={() => setNieuw(null)}
              className="rounded-full border border-sand px-5 py-2.5 text-sm text-ink transition hover:border-ink-soft"
            >
              Terug naar de lijst
            </button>
            <p className="w-full text-[11px] text-ink-soft">
              De overige gegevens vult u later aan bij{" "}
              <Link href="/configurator/klanten" className="underline underline-offset-2">
                Klanten
              </Link>
              .
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
              <input
                type="search"
                value={zoek}
                onChange={(e) => setZoek(e.target.value)}
                placeholder="Zoek een klant"
                className="w-full rounded-full border border-sand bg-paper py-2.5 pl-9 pr-3 text-sm outline-none focus:border-rebu-green"
              />
            </div>
            <button
              type="button"
              onClick={() => setNieuw({ naam: zoek, plaats: "", adres: "" })}
              className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2.5 text-sm text-ink transition hover:bg-ink hover:text-paper"
            >
              <UserPlus className="h-4 w-4" />
              Nieuwe klant
            </button>
          </div>

          {klanten.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-sand p-8 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-ink-soft" />
              <p className="font-medium text-ink">U heeft nog geen klanten</p>
              <p className="mt-1 text-sm text-ink-soft">
                Maak uw eerste klant aan; daarna hoeft u zijn gegevens nooit meer over te typen.
              </p>
              <button
                type="button"
                onClick={() => setNieuw({ naam: "", plaats: "", adres: "" })}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark"
              >
                <Plus className="h-4 w-4" />
                Klant aanmaken
              </button>
            </div>
          ) : (
            <ul className="mt-5 space-y-2">
              {zichtbaar.map((klant) => (
                <li key={klant.id}>
                  <button
                    type="button"
                    onClick={() => onKies(klant.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-sand bg-paper p-4 text-left transition hover:border-rebu-green hover:bg-rebu-tint"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{klant.naam}</span>
                      {(klant.adres || klant.plaats) && (
                        <span className="block truncate text-xs text-ink-soft">
                          {[klant.adres, klant.plaats].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft" />
                  </button>
                </li>
              ))}
              {zichtbaar.length === 0 && (
                <li className="rounded-xl border border-dashed border-sand p-6 text-center text-sm text-ink-soft">
                  Geen klant gevonden voor &lsquo;{zoek}&rsquo;.
                </li>
              )}
            </ul>
          )}

          <button
            type="button"
            onClick={() => onKies(null)}
            className="mt-6 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Verder zonder klant — ik koppel hem later
          </button>
        </>
      )}
    </div>
  );
}
