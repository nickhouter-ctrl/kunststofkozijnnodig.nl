"use client";

/**
 * De klantenlijst van de aannemer: de eindklanten waar hij offertes voor maakt.
 *
 * Eén keer invoeren, daarna bij elke offerte kiezen — dat is het hele doel. Er
 * staat niet meer in dan wat er op een offerte terecht moet komen, plus een
 * notitie voor wat je zelf wilt onthouden.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, Users, X } from "lucide-react";
import type { Klant, Klantinvoer } from "@/configurator/opslag/repository";

const LEEG: Klantinvoer = {
  naam: "",
  contactpersoon: "",
  email: "",
  telefoon: "",
  adres: "",
  postcode: "",
  plaats: "",
  notitie: "",
};

function Veld({
  label,
  waarde,
  onWijzig,
  type = "text",
  breed,
  regels,
}: {
  label: string;
  waarde: string;
  onWijzig: (waarde: string) => void;
  type?: string;
  breed?: boolean;
  regels?: number;
}) {
  return (
    <label className={`block ${breed ? "sm:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs text-ink-soft">{label}</span>
      {regels ? (
        <textarea
          value={waarde}
          rows={regels}
          onChange={(e) => onWijzig(e.target.value)}
          className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
        />
      ) : (
        <input
          type={type}
          value={waarde}
          onChange={(e) => onWijzig(e.target.value)}
          className="w-full rounded-lg border border-sand px-3 py-2 text-sm outline-none focus:border-rebu-green"
        />
      )}
    </label>
  );
}

export function KlantenBeheer() {
  const [klanten, setKlanten] = useState<Klant[] | null>(null);
  const [zoek, setZoek] = useState("");
  const [formulier, setFormulier] = useState<{ id: string | null; velden: Klantinvoer } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const laden = useCallback(async () => {
    try {
      const antwoord = await fetch("/api/configurator/klanten");
      const data = await antwoord.json();
      setKlanten(data.klanten ?? []);
    } catch {
      setFout("Kon de klantenlijst niet ophalen.");
      setKlanten([]);
    }
  }, []);

  useEffect(() => {
    void laden();
  }, [laden]);

  const bewaar = async () => {
    if (!formulier) return;
    if (formulier.velden.naam.trim() === "") {
      setFout("Vul in ieder geval een naam in.");
      return;
    }
    setBezig(true);
    setFout(null);
    try {
      const antwoord = await fetch("/api/configurator/klanten", {
        method: formulier.id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formulier.id ? { id: formulier.id, ...formulier.velden } : formulier.velden),
      });
      const data = await antwoord.json();
      if (!antwoord.ok) {
        setFout(data.fout ?? "Opslaan is niet gelukt.");
        return;
      }
      setFormulier(null);
      await laden();
    } catch {
      setFout("Kon de server niet bereiken.");
    } finally {
      setBezig(false);
    }
  };

  const verwijder = async (klant: Klant) => {
    setBezig(true);
    try {
      await fetch(`/api/configurator/klanten?id=${encodeURIComponent(klant.id)}`, { method: "DELETE" });
      await laden();
    } finally {
      setBezig(false);
    }
  };

  const term = zoek.trim().toLowerCase();
  const zichtbaar = (klanten ?? []).filter((k) =>
    term === ""
      ? true
      : [k.naam, k.contactpersoon, k.plaats, k.email, k.telefoon]
          .join(" ")
          .toLowerCase()
          .includes(term)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Klanten</h1>
          <p className="mt-1 text-sm text-ink-soft">
            De klanten waar u offertes voor maakt. Eén keer invoeren; daarna kiest u ze bij het
            opslaan van een offerte en staan naam en adres vanzelf op het document.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormulier({ id: null, velden: { ...LEEG } })}
          className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark"
        >
          <Plus className="h-4 w-4" />
          Nieuwe klant
        </button>
      </div>

      {fout && (
        <p className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</p>
      )}

      {formulier && (
        <div className="mb-6 rounded-2xl border border-rebu-green bg-paper p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-ink">
              {formulier.id ? "Klant aanpassen" : "Nieuwe klant"}
            </h2>
            <button
              type="button"
              onClick={() => setFormulier(null)}
              className="rounded-full p-1.5 text-ink-soft transition hover:bg-sand hover:text-ink"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Veld
              label="Naam of bedrijfsnaam"
              waarde={formulier.velden.naam}
              onWijzig={(naam) => setFormulier({ ...formulier, velden: { ...formulier.velden, naam } })}
            />
            <Veld
              label="Contactpersoon"
              waarde={formulier.velden.contactpersoon}
              onWijzig={(contactpersoon) =>
                setFormulier({ ...formulier, velden: { ...formulier.velden, contactpersoon } })
              }
            />
            <Veld
              label="E-mailadres"
              type="email"
              waarde={formulier.velden.email}
              onWijzig={(email) => setFormulier({ ...formulier, velden: { ...formulier.velden, email } })}
            />
            <Veld
              label="Telefoon"
              waarde={formulier.velden.telefoon}
              onWijzig={(telefoon) =>
                setFormulier({ ...formulier, velden: { ...formulier.velden, telefoon } })
              }
            />
            <Veld
              label="Adres"
              breed
              waarde={formulier.velden.adres}
              onWijzig={(adres) => setFormulier({ ...formulier, velden: { ...formulier.velden, adres } })}
            />
            <Veld
              label="Postcode"
              waarde={formulier.velden.postcode}
              onWijzig={(postcode) =>
                setFormulier({ ...formulier, velden: { ...formulier.velden, postcode } })
              }
            />
            <Veld
              label="Plaats"
              waarde={formulier.velden.plaats}
              onWijzig={(plaats) => setFormulier({ ...formulier, velden: { ...formulier.velden, plaats } })}
            />
            <Veld
              label="Notitie"
              breed
              regels={2}
              waarde={formulier.velden.notitie}
              onWijzig={(notitie) =>
                setFormulier({ ...formulier, velden: { ...formulier.velden, notitie } })
              }
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={bewaar}
              disabled={bezig}
              className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark disabled:bg-sand disabled:text-ink-soft"
            >
              {bezig && <Loader2 className="h-4 w-4 animate-spin" />}
              Bewaren
            </button>
            <button
              type="button"
              onClick={() => setFormulier(null)}
              className="rounded-full border border-sand px-5 py-2.5 text-sm text-ink transition hover:border-ink-soft"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op naam, plaats of e-mail"
            className="w-72 rounded-full border border-sand bg-paper py-2 pl-9 pr-3 text-sm outline-none focus:border-rebu-green"
          />
        </div>
        <span className="text-xs text-ink-soft">
          {klanten === null ? "" : `${zichtbaar.length} van ${klanten.length}`}
        </span>
      </div>

      {klanten === null ? (
        <p className="flex items-center gap-2 py-10 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Klanten worden opgehaald…
        </p>
      ) : zichtbaar.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand p-10 text-center">
          <Users className="mx-auto mb-3 h-8 w-8 text-ink-soft" />
          <p className="font-medium text-ink">
            {klanten.length === 0 ? "Nog geen klanten" : "Geen klant gevonden"}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {klanten.length === 0
              ? "Voeg uw eerste klant toe; daarna hoeft u zijn gegevens nooit meer over te typen."
              : "Pas uw zoekopdracht aan."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {zichtbaar.map((klant) => (
            <li
              key={klant.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-sand bg-paper p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{klant.naam}</p>
                <p className="truncate text-xs text-ink-soft">
                  {[klant.contactpersoon, [klant.adres, klant.postcode, klant.plaats].filter(Boolean).join(" ")]
                    .filter(Boolean)
                    .join(" · ") || "Geen adresgegevens"}
                </p>
                {(klant.email || klant.telefoon) && (
                  <p className="text-xs text-ink-soft">
                    {[klant.email, klant.telefoon].filter(Boolean).join(" · ")}
                  </p>
                )}
                {klant.notitie && <p className="mt-1 text-xs italic text-ink-soft">{klant.notitie}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setFormulier({
                      id: klant.id,
                      velden: {
                        naam: klant.naam,
                        contactpersoon: klant.contactpersoon,
                        email: klant.email,
                        telefoon: klant.telefoon,
                        adres: klant.adres,
                        postcode: klant.postcode,
                        plaats: klant.plaats,
                        notitie: klant.notitie,
                      },
                    })
                  }
                  className="rounded-lg border border-sand p-2 text-ink-soft transition hover:border-ink-soft hover:text-ink"
                  aria-label={`${klant.naam} aanpassen`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => verwijder(klant)}
                  className="rounded-lg border border-sand p-2 text-ink-soft transition hover:border-red-300 hover:text-red-700"
                  aria-label={`${klant.naam} verwijderen`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-ink-soft">
        Een klant verwijderen laat bestaande offertes ongemoeid: die dragen hun eigen kopie van naam
        en adres, zodat een verstuurd document nooit achteraf verandert.
      </p>
    </div>
  );
}
