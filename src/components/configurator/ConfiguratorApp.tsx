"use client";

/**
 * De configurator — order-eerst en tekening-eerst.
 *
 * De opbouw volgt hoe er in de praktijk gewerkt wordt: bovenaan staan de vaste
 * gegevens van de héle order (profiel, kleur, hoekverbinding, glas, afwatering),
 * links staan de kozijnen die al in de order zitten, en in het midden werk je in
 * de tekening zelf. Een nieuw kozijn erbij neemt de vaste gegevens automatisch
 * over — die horen immers bij de order, niet bij het losse kozijn.
 *
 * De doorrekening gebeurt lokaal met exact dezelfde engine als de server — dat
 * geeft de directe reactie die hoofdstuk 8.1 vraagt. Bij opslaan herhaalt de
 * server elke controle onafhankelijk (borgingslaag 3).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Box,
  Check,
  FileText,
  Layers,
  Loader2,
  Lock,
  PhoneCall,
  Receipt,
  Ruler,
  Settings2,
} from "lucide-react";
import { bereken } from "@/configurator/engine";
import { berekenGeometrie } from "@/configurator/engine/maten";
import { berekenLeverweek } from "@/configurator/engine/documenten";
import { orderLock } from "@/configurator/engine/orderlock";
import { dupliceer, standaardConfiguratie } from "@/configurator/data/standaard";
import { schaalVasteMaten } from "@/configurator/engine/indeling";
import { euroTekst } from "@/configurator/engine/prijs";
import { BevindingRegel, BevindingenPopup } from "./BevindingenPopup";
import { Bewerkvlak, type Selectie } from "./Bewerkvlak";
import { Perspectief } from "./Perspectief";
import { Eigenschappen } from "./Eigenschappen";
import { Basispaneel } from "./Basispaneel";
import { Bovenbalk } from "./Bovenbalk";
import { Elementenlijst } from "./Elementenlijst";
import { DocumentPopup, type DocumentSoort, type Opgeslagen } from "./DocumentPopup";
import { OfferteStart, type KlantKeuze } from "./OfferteStart";
import { MaatvoeringPaneel } from "./MaatvoeringPaneel";
import { TekeningPaneel } from "./TekeningPaneel";
import type { Bevinding, Configuratie, Prijscontext } from "@/configurator/types";

const sleutel = (b: Bevinding) => `${b.regelId}|${b.kop}`;

type Tab = "onderdeel" | "basis" | "maten" | "tekeningen";

const TABS: { id: Tab; label: string; icoon: typeof Layers }[] = [
  { id: "onderdeel", label: "Onderdeel", icoon: Layers },
  { id: "basis", label: "Dit kozijn", icoon: Settings2 },
  { id: "maten", label: "Maatvoering", icoon: Ruler },
  { id: "tekeningen", label: "Tekeningen", icoon: FileText },
];

/**
 * De gegevens die bij de órder horen en niet bij het losse kozijn. Een nieuw
 * kozijn erft ze; de bovenbalk wijzigt ze in één keer voor alle kozijnen.
 */
const ORDERVELDEN = [
  "profielId",
  "hoekverbinding",
  "kleurBinnenId",
  "kleurBuitenId",
  "vleugelKleurBinnenId",
  "vleugelKleurBuitenId",
  "afwatering",
  "glas",
] as const;

function neemOrdergegevensOver(van: Configuratie, naar: Configuratie): Configuratie {
  const uit = { ...naar };
  for (const veld of ORDERVELDEN) {
    // De velden zijn per definitie gelijk van type; de cast houdt het leesbaar.
    (uit as Record<string, unknown>)[veld] = van[veld];
  }
  uit.glas = { ...van.glas };
  return uit;
}

export function ConfiguratorApp({ startContext }: { startContext: Prijscontext }) {
  const [context, setContext] = useState<Prijscontext>(startContext);
  const [marge, setMarge] = useState(0.25);
  const [elementen, setElementen] = useState<Configuratie[]>(() => [standaardConfiguratie()]);
  const [actief, setActief] = useState(0);
  const [zijde, setZijde] = useState<"binnen" | "buiten">("binnen");
  // Naast het platte aanzicht is er een schuine weergave: daarin zie je de
  // diepte van het profiel en hoe de vleugel over het kader valt.
  const [weergave, setWeergave] = useState<"vlak" | "perspectief">("vlak");
  const [selectie, setSelectie] = useState<Selectie>(null);
  const [tab, setTab] = useState<Tab>("basis");
  const [popupOpen, setPopupOpen] = useState(false);
  const [escalatieOpen, setEscalatieOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState<Opgeslagen[] | null>(null);
  const [documentSoort, setDocumentSoort] = useState<DocumentSoort | null>(null);
  const [serverfout, setServerfout] = useState<string | null>(null);
  // De offerte waar we aan werken; gevuld zodra er is opgeslagen of geopend.
  const [projectId, setProjectId] = useState<string | null>(null);
  const [klanten, setKlanten] = useState<KlantKeuze[]>([]);
  const [klantId, setKlantId] = useState<string>("");
  const [laadt, setLaadt] = useState(false);
  // Een nieuwe offerte begint bij de klant; pas daarna kom je in de tekening.
  const [startKlaar, setStartKlaar] = useState(false);

  const zoekopdracht = useSearchParams();
  const teOpenenOfferte = zoekopdracht.get("offerte");

  // De klantenlijst is nodig om een offerte aan een eindklant te hangen.
  useEffect(() => {
    fetch("/api/configurator/klanten")
      .then((r) => r.json())
      .then((d) => setKlanten(d.klanten ?? []))
      .catch(() => setKlanten([]));
  }, []);

  /**
   * Een bestaande offerte openen: alle kozijnen komen terug in hun laatste
   * versie, zodat er verder aan gewerkt kan worden. Opslaan maakt daarna weer
   * een nieuwe versie; de vorige blijft ongewijzigd bewaard.
   */
  useEffect(() => {
    if (!teOpenenOfferte) return;
    setLaadt(true);
    fetch(`/api/configurator/offertes?project=${encodeURIComponent(teOpenenOfferte)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.kozijnen || d.kozijnen.length === 0) {
          setServerfout("Deze offerte bevat nog geen kozijnen.");
          return;
        }
        setElementen(d.kozijnen.map((k: { configuratie: Configuratie }) => k.configuratie));
        setActief(0);
        setProjectId(d.project.id);
        setKlantId(d.project.klantId ?? "");
        setMarge(d.project.aannemersmarge ?? 0.25);
        setContext(d.project.context ?? "aannemer");
      })
      .catch(() => setServerfout("Kon deze offerte niet openen."))
      .finally(() => setLaadt(false));
  }, [teOpenenOfferte]);

  const configuratie = elementen[Math.min(actief, elementen.length - 1)];

  const berekeningen = useMemo(
    () => elementen.map((c) => bereken(c, { context, aannemersmarge: marge })),
    [elementen, context, marge]
  );
  const berekening = berekeningen[Math.min(actief, berekeningen.length - 1)];

  const leverweek = useMemo(() => berekenLeverweek(new Date(), berekening), [berekening]);
  const lock = useMemo(() => orderLock(berekening), [berekening]);
  // De uitgelegde stijlen; het eigenschappenpaneel toont daarmee de hartmaat.
  const geometrie = useMemo(
    () => berekenGeometrie(configuratie, berekening.profiel),
    [configuratie, berekening.profiel]
  );

  const ordertotaal = berekeningen.reduce((som, b) => som + b.prijs.klantprijsTotaalInclBtw, 0);
  const orderInkoop = berekeningen.reduce(
    (som, b) => som + (b.prijs.aannemersprijsTotaalInclBtw ?? 0),
    0
  );
  const blokkeertErgens = berekeningen.some((b) => b.blokkeert);

  /**
   * Regel 3 vraagt om directe, begrijpelijke terugkoppeling bij een niet-
   * produceerbare maat. Dat gebeurt met een vaste melding naast de tekening én
   * met de bevindingen in het zijpaneel.
   *
   * De pop-up onderbreekt bewust NIET tijdens het typen: tussen '1' en '1000'
   * is een maat nu eenmaal even ongeldig, en daar wil niemand een venster voor.
   * Hij verschijnt zodra je opslaat, en wanneer je de melding zelf aanklikt.
   */
  const gezien = useRef<Set<string>>(new Set());
  useEffect(() => {
    gezien.current = new Set(
      berekening.bevindingen
        .filter((b) => b.type === "blokkade" || b.type === "escalatie")
        .map(sleutel)
    );
  }, [berekening.bevindingen]);

  const vergeetOpslag = () => {
    setOpgeslagen(null);
    setServerfout(null);
  };

  // De wijzigfuncties blijven stabiel; welk kozijn actief is lezen ze uit een ref.
  const actiefRef = useRef(actief);
  useEffect(() => {
    actiefRef.current = actief;
  }, [actief]);

  /**
   * Wijzigt alleen het kozijn waar je nu in werkt.
   *
   * Verandert de buitenmaat, dan schaalt de indeling mee: vastgezette vakken
   * houden hun verhouding in plaats van dat één buurvak het hele verschil
   * opvangt. Wie tegelijk een nieuwe indeling meestuurt bepaalt die zelf al.
   */
  const wijzig = useCallback((patch: Partial<Configuratie>) => {
    setElementen((huidig) =>
      huidig.map((c, i) => {
        if (i !== actiefRef.current) return c;
        const nieuw = { ...c, ...patch };
        const maatWijziging =
          (patch.breedte !== undefined && patch.breedte !== c.breedte) ||
          (patch.hoogte !== undefined && patch.hoogte !== c.hoogte);
        if (maatWijziging && patch.indeling === undefined && c.breedte > 0 && c.hoogte > 0) {
          nieuw.indeling = schaalVasteMaten(c.indeling, {
            breedte: nieuw.breedte / c.breedte,
            hoogte: nieuw.hoogte / c.hoogte,
          });
        }
        return nieuw;
      })
    );
    setOpgeslagen(null);
    setServerfout(null);
  }, []);

  /** Wijzigt de vaste gegevens van élk kozijn in de order. */
  const wijzigAlle = useCallback((patch: Partial<Configuratie>) => {
    setElementen((huidig) => huidig.map((c) => ({ ...c, ...patch })));
    setOpgeslagen(null);
    setServerfout(null);
  }, []);

  const vervang = useCallback((nieuw: Configuratie) => {
    setElementen((huidig) => huidig.map((c, i) => (i === actiefRef.current ? nieuw : c)));
    setSelectie(null);
    setOpgeslagen(null);
    setServerfout(null);
  }, []);

  /** Een volgend kozijn, met de vaste gegevens van de order erin. */
  const nieuwKozijn = () => {
    const basis = standaardConfiguratie(configuratie.profielId, "vast");
    const nieuw = neemOrdergegevensOver(configuratie, {
      ...basis,
      naam: `Kozijn ${elementen.length + 1}`,
    });
    setElementen((huidig) => [...huidig, nieuw]);
    setActief(elementen.length);
    setSelectie(null);
    vergeetOpslag();
  };

  const dupliceerElement = (index: number) => {
    const kopie = dupliceer(elementen[index], `${elementen[index].naam} (kopie)`);
    setElementen((huidig) => [...huidig.slice(0, index + 1), kopie, ...huidig.slice(index + 1)]);
    setActief(index + 1);
    setSelectie(null);
    vergeetOpslag();
  };

  const verwijderElement = (index: number) => {
    setElementen((huidig) => (huidig.length === 1 ? huidig : huidig.filter((_, i) => i !== index)));
    setActief((h) => (index < h || h >= elementen.length - 1 ? Math.max(0, h - 1) : h));
    setSelectie(null);
    vergeetOpslag();
  };

  // Klikken in de tekening springt automatisch naar het onderdeelpaneel.
  const selecteer = useCallback((nieuw: Selectie) => {
    setSelectie(nieuw);
    if (nieuw) setTab("onderdeel");
  }, []);

  const ernstige = berekening.bevindingen.filter(
    (b) => b.type === "blokkade" || b.type === "escalatie"
  );

  /**
   * Opslaan doet de hele order in één keer: het eerste kozijn maakt het project
   * aan, de rest hangt zich aan datzelfde project. Elk kozijn krijgt zijn eigen
   * versie, zodat er per kozijn documenten te maken zijn.
   */
  const opslaan = async () => {
    // Hier hoort de pop-up wél: dit is het moment waarop het echt vastloopt.
    if (blokkeertErgens) {
      const eerste = berekeningen.findIndex((b) => b.blokkeert);
      setActief(eerste);
      setPopupOpen(true);
      return;
    }
    setBezig(true);
    setServerfout(null);
    try {
      const bewaard: Opgeslagen[] = [];
      // Werken we aan een bestaande offerte, dan komen de nieuwe versies daarin.
      let lopendProject: string | undefined = projectId ?? undefined;
      for (const c of elementen) {
        const antwoord = await fetch("/api/configurator/opslaan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            configuratie: c,
            context,
            aannemersmarge: marge,
            projectId: lopendProject,
            klantId: klantId || null,
            projectnaam:
              klanten.find((k) => k.id === klantId)?.naam ??
              `Offerte ${new Date().toLocaleDateString("nl-NL")}`,
          }),
        });
        const data = await antwoord.json();
        if (!antwoord.ok) {
          setServerfout(data.fout ?? "Opslaan is niet gelukt.");
          return;
        }
        lopendProject = data.projectId;
        bewaard.push({ naam: c.naam, snapshotId: data.snapshotId, versie: data.versie });
      }
      setProjectId(lopendProject ?? null);
      setOpgeslagen(bewaard);
    } catch {
      setServerfout("Kon de server niet bereiken. Draait de dev-server nog?");
    } finally {
      setBezig(false);
    }
  };

  if (laadt) {
    return (
      <p className="flex items-center justify-center gap-2 py-24 text-sm text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" />
        Offerte wordt geopend…
      </p>
    );
  }

  // Een bestaande offerte openen slaat het startscherm over: de klant staat er al.
  if (!startKlaar && !teOpenenOfferte) {
    return (
      <OfferteStart
        klanten={klanten}
        onKies={(gekozen) => {
          setKlantId(gekozen ?? "");
          setStartKlaar(true);
        }}
        onNieuweKlant={(klant) => setKlanten((h) => [...h, klant])}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Contextschakelaar — in productie volgt de context uit de login. */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-sand bg-rebu-cream px-4 py-2.5">
        <span className="text-[11px] uppercase tracking-editorial text-ink-soft">Testomgeving</span>
        <div className="flex gap-1.5">
          {(["publiek", "aannemer"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setContext(c)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                context === c ? "bg-ink text-paper" : "border border-sand text-ink-soft"
              }`}
            >
              {c === "publiek" ? "Publieke bezoeker" : "Ingelogde aannemer"}
            </button>
          ))}
        </div>
        {/* De margeknop is er alleen voor de aannemer: hij zet zijn eigen marge
            bovenop wat hij aan ons betaalt. */}
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          Klant
          <select
            value={klantId}
            onChange={(e) => {
              setKlantId(e.target.value);
              setOpgeslagen(null);
            }}
            className="rounded border border-sand px-2 py-1 text-ink"
          >
            <option value="">Geen klant gekoppeld</option>
            {klanten.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naam}
              </option>
            ))}
          </select>
        </label>
        {context === "aannemer" && (
          <label className="flex items-center gap-2 text-xs text-ink-soft">
            Uw marge
            <input
              type="number"
              min={0}
              max={200}
              value={Math.round(marge * 100)}
              onChange={(e) => setMarge(Math.max(0, Number(e.target.value) || 0) / 100)}
              className="w-16 rounded border border-sand px-2 py-1 text-ink"
            />
            %
          </label>
        )}
      </div>

      <div className="mb-4">
        <Bovenbalk
          configuratie={configuratie}
          profiel={berekening.profiel}
          wijzigAlle={wijzigAlle}
          aantalElementen={elementen.length}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_400px]">
        {/* --------------------------------------------------------------- */}
        {/* Links: de kozijnen in deze order                                */}
        {/* --------------------------------------------------------------- */}
        <div className="xl:sticky xl:top-4 xl:self-start">
          <Elementenlijst
            berekeningen={berekeningen}
            actief={actief}
            onKies={(i) => {
              setActief(i);
              setSelectie(null);
            }}
            onNieuw={nieuwKozijn}
            onDupliceer={dupliceerElement}
            onVerwijder={verwijderElement}
          />
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Midden: de tekening waarin je werkt                             */}
        {/* --------------------------------------------------------------- */}
        <div>
          {ernstige.length > 0 && (
            <button
              type="button"
              onClick={() => setPopupOpen(true)}
              className="mb-3 flex w-full items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-left text-sm text-red-800 transition hover:bg-red-100"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="flex-1">
                {ernstige.length === 1
                  ? ernstige[0].kop
                  : `${ernstige.length} punten die aandacht nodig hebben`}
              </span>
              <span className="text-xs underline underline-offset-2">bekijk</span>
            </button>
          )}

          <div className="rounded-2xl border border-sand bg-paper p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWeergave((w) => (w === "vlak" ? "perspectief" : "vlak"))}
                    aria-pressed={weergave === "perspectief"}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                      weergave === "perspectief"
                        ? "bg-rebu-green text-paper"
                        : "border border-sand text-ink-soft hover:border-ink-soft hover:text-ink"
                    }`}
                  >
                    <Box className="h-3.5 w-3.5" />
                    3D-weergave
                  </button>
                </div>
                <input
                  value={configuratie.naam}
                  onChange={(e) => wijzig({ naam: e.target.value })}
                  className="rounded-lg border border-transparent bg-transparent px-1 py-0.5 font-display text-2xl text-ink outline-none hover:border-sand focus:border-rebu-green"
                  aria-label="Naam van dit kozijn"
                />
                <p className="px-1 text-xs text-ink-soft">
                  {berekening.profiel.merkLabel} {berekening.profiel.naam} ·{" "}
                  {berekening.profiel.uitvoeringLabel} · {configuratie.breedte} ×{" "}
                  {configuratie.hoogte} mm
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["binnen", "buiten"] as const).map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZijde(z)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
                      zijde === z ? "bg-ink text-paper" : "border border-sand text-ink-soft"
                    }`}
                  >
                    {z === "binnen" ? "Binnenaanzicht" : "Buitenaanzicht"}
                  </button>
                ))}
              </div>
            </div>

            {weergave === "perspectief" ? (
              <Perspectief berekening={berekening} zijde={zijde} />
            ) : (
            <div onClick={() => selecteer(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                <Bewerkvlak
                  berekening={berekening}
                  zijde={zijde}
                  selectie={selectie}
                  onSelecteer={selecteer}
                  onIndeling={(indeling) => wijzig({ indeling })}
                  onConfiguratie={wijzig}
                />
              </div>
            </div>
            )}
          </div>

          {/* Prijs en opslaan onder de tekening. */}
          <div className="mt-4 rounded-2xl border border-sand bg-paper p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-editorial text-ink-soft">
                  {berekening.prijs.isRichtprijs ? "Richtprijs hele order" : "Hele order voor uw klant"}
                </p>
                <p className="font-display text-3xl text-ink">{euroTekst(ordertotaal)}</p>
                <p className="text-xs text-ink-soft">
                  incl. btw · {elementen.length} {elementen.length === 1 ? "kozijn" : "kozijnen"} ·
                  levering {leverweek}
                </p>
              </div>
              {orderInkoop > 0 && (
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-editorial text-ink-soft">
                    Uw inkoop bij ons
                  </p>
                  <p className="font-display text-xl text-ink">{euroTekst(orderInkoop)}</p>
                  <p className="text-xs text-rebu-green">
                    uw marge {berekening.prijs.aannemersmargePercentage}% ={" "}
                    {euroTekst(ordertotaal - orderInkoop)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-sand pt-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
                <Lock className="h-4 w-4 text-rebu-green" />
                Eindcontrole vóór productie — {configuratie.naam}
              </p>
              <ul className="space-y-1">
                {lock.controles.map((c) => (
                  <li key={c.id} className="flex items-start gap-2 text-sm">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                        c.geslaagd ? "bg-rebu-green text-paper" : "bg-red-500 text-paper"
                      }`}
                    >
                      {c.geslaagd ? "✓" : "!"}
                    </span>
                    <span className={c.geslaagd ? "text-ink-soft" : "text-red-700"}>
                      {c.omschrijving}
                      {c.toelichting && <span className="block text-xs">{c.toelichting}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {serverfout && (
              <p className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                {serverfout}
              </p>
            )}

            {opgeslagen ? (
              <div className="mt-4 rounded-xl border border-rebu-green bg-rebu-tint p-4">
                <p className="flex items-center gap-2 font-medium text-rebu-green-dark">
                  <Check className="h-4 w-4" />
                  {opgeslagen.length === 1
                    ? `Opgeslagen als versie ${opgeslagen[0].versie}`
                    : `${opgeslagen.length} kozijnen opgeslagen`}
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Elke volgende opslag maakt een nieuwe versie; deze blijft ongewijzigd bewaard. Bekijk
                  de documenten hieronder voordat u ze verstuurt.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDocumentSoort("offerte")}
                    className="inline-flex items-center gap-2 rounded-full bg-rebu-green px-4 py-2 text-sm text-paper transition hover:bg-rebu-green-dark"
                  >
                    <FileText className="h-4 w-4" />
                    Offerte voor uw klant
                  </button>
                  {context === "aannemer" && (
                    <button
                      type="button"
                      onClick={() => setDocumentSoort("factuur")}
                      className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm text-ink transition hover:bg-ink hover:text-paper"
                    >
                      <Receipt className="h-4 w-4" />
                      Onze factuur aan u
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDocumentSoort("fabrieksorder")}
                    className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm text-ink-soft transition hover:border-ink-soft"
                  >
                    <Lock className="h-4 w-4" />
                    Fabrieksorder
                  </button>
                </div>
                <button
                  type="button"
                  onClick={nieuwKozijn}
                  className="mt-3 text-sm text-rebu-green underline underline-offset-4 hover:text-rebu-green-dark"
                >
                  Verder met een volgend kozijn — kleur en hoekverbinding gaan mee
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={opslaan}
                  disabled={bezig}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rebu-green px-6 py-3 font-medium text-paper transition hover:bg-rebu-green-dark disabled:cursor-not-allowed disabled:bg-sand disabled:text-ink-soft"
                >
                  {bezig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {blokkeertErgens
                    ? "Los eerst de blokkades op"
                    : elementen.length === 1
                      ? "Opslaan en documenten maken"
                      : `Alle ${elementen.length} kozijnen opslaan`}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setEscalatieOpen(true)}
              className="mt-3 w-full text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Loop ik vast? Neem contact op met Rebu
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Rechts: eigenschappen, dit kozijn, maatvoering en tekeningen    */}
        {/* --------------------------------------------------------------- */}
        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="rounded-2xl border border-sand bg-paper">
            <div className="flex border-b border-sand">
              {TABS.map(({ id, label, icoon: Icoon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs transition ${
                    tab === id
                      ? "border-b-2 border-rebu-green font-medium text-ink"
                      : "text-ink-soft hover:text-ink"
                  }`}
                >
                  <Icoon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {tab === "onderdeel" && (
                <Eigenschappen
                  configuratie={configuratie}
                  profielMerk={berekening.profiel.merk}
                  vakken={berekening.vakken}
                  stijlen={geometrie.stijlen}
                  selectie={selectie}
                  wijzig={wijzig}
                  onSelecteer={selecteer}
                />
              )}
              {tab === "basis" && (
                <Basispaneel
                  configuratie={configuratie}
                  berekening={berekening}
                  wijzig={wijzig}
                  vervang={vervang}
                />
              )}
              {tab === "maten" && <MaatvoeringPaneel berekening={berekening} />}
              {tab === "tekeningen" && <TekeningPaneel berekening={berekening} />}
            </div>
          </div>

          {berekening.bevindingen.length > 0 && (
            <div className="mt-4 space-y-2">
              {berekening.bevindingen.slice(0, 4).map((b, i) => (
                <BevindingRegel key={`${b.regelId}-${i}`} bevinding={b} />
              ))}
            </div>
          )}
        </aside>
      </div>

      <BevindingenPopup
        bevindingen={ernstige}
        open={popupOpen}
        onSluiten={() => setPopupOpen(false)}
        onNaarStap={() => setTab("basis")}
        onEscaleren={() => {
          setPopupOpen(false);
          setEscalatieOpen(true);
        }}
      />

      <DocumentPopup
        soort={documentSoort}
        elementen={opgeslagen ?? []}
        onSluiten={() => setDocumentSoort(null)}
      />

      {escalatieOpen && (
        <EscalatieDialoog
          configuratie={configuratie}
          bevindingen={berekening.bevindingen}
          onSluiten={() => setEscalatieOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Escalatie naar een mens (regel 4)
// ---------------------------------------------------------------------------

function EscalatieDialoog({
  configuratie,
  bevindingen,
  onSluiten,
}: {
  configuratie: Configuratie;
  bevindingen: Bevinding[];
  onSluiten: () => void;
}) {
  const [naam, setNaam] = useState("");
  const [contact, setContact] = useState("");
  const [bericht, setBericht] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const versturen = async () => {
    setBezig(true);
    setFout(null);
    try {
      const antwoord = await fetch("/api/configurator/escalatie", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ naam, contact, bericht, configuratie, bevindingen }),
      });
      if (!antwoord.ok) {
        const data = await antwoord.json().catch(() => ({}));
        setFout(data.fout ?? "Versturen is niet gelukt.");
        return;
      }
      setVerstuurd(true);
    } catch {
      setFout("Kon de server niet bereiken.");
    } finally {
      setBezig(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-soft">
        <h2 className="mb-1 font-display text-2xl text-ink">Even samen naar kijken</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Uw volledige configuratie wordt automatisch meegestuurd, zodat u niets hoeft over te typen.
        </p>

        {verstuurd ? (
          <div className="rounded-lg border border-rebu-green bg-rebu-tint p-4">
            <p className="font-medium text-rebu-green-dark">Uw aanvraag staat klaar.</p>
            <p className="mt-1 text-sm text-ink-soft">
              We nemen contact op via {contact}. De configuratie is meegestuurd.
            </p>
            <button
              type="button"
              onClick={onSluiten}
              className="mt-3 rounded-full bg-ink px-5 py-2 text-sm text-paper"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="Uw naam"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm outline-none focus:border-rebu-green"
            />
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="E-mailadres of telefoonnummer"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm outline-none focus:border-rebu-green"
            />
            <textarea
              value={bericht}
              onChange={(e) => setBericht(e.target.value)}
              rows={3}
              placeholder="Wat wilt u maken?"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm outline-none focus:border-rebu-green"
            />
            {fout && <p className="text-sm text-red-700">{fout}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={versturen}
                disabled={bezig || naam.trim() === "" || contact.trim() === ""}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-rebu-green px-5 py-2.5 text-sm text-paper transition hover:bg-rebu-green-dark disabled:bg-sand disabled:text-ink-soft"
              >
                {bezig ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Stuur mijn configuratie mee
              </button>
              <a
                href="tel:+31658866070"
                className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm text-ink transition hover:bg-ink hover:text-paper"
              >
                <PhoneCall className="h-4 w-4" />
                Bellen
              </a>
            </div>
            <button
              type="button"
              onClick={onSluiten}
              className="w-full text-xs text-ink-soft underline underline-offset-4"
            >
              Annuleren
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
