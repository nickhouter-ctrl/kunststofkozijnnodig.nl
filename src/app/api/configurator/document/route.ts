/**
 * Levert de klantofferte, onze factuur of de fabrieksorder als HTML
 * (afdrukbaar naar PDF).
 *
 * Regel 6: de documenten komen uit dezelfde configuratie-snapshot, maar worden
 * apart doorgerekend — de klantofferte zonder inkoopprijs, de fabrieksorder
 * mét. De documentgenerator weigert de omgekeerde combinatie.
 *
 * Met `snapshot=` vraag je één kozijn op, met `project=` de hele offerte: alle
 * kozijnen in hun laatste versie, achter elkaar op één blad.
 */
import { NextResponse } from "next/server";
import { bereken } from "@/configurator/engine";
import {
  REBU_BRANDING,
  berekenLeverweek,
  bundelDocumenten,
  fabrieksorder,
  klantofferte,
  rebuFactuur,
} from "@/configurator/engine/documenten";
import { project, snapshot, snapshotsVanProject } from "@/configurator/opslag/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Bouwt één document voor één opgeslagen kozijn. */
function documentVoor(snapshotId: string, soort: string): string | null {
  const bewaard = snapshot(snapshotId);
  if (!bewaard) return null;

  const bijbehorend = project(bewaard.projectId);
  const context = bijbehorend?.context ?? "aannemer";
  // De marge die bij het project hoort, niet de standaardmarge — anders wijkt
  // de offerte af van wat de aannemer op het scherm zag (regel 7).
  const aannemersmarge = bijbehorend?.aannemersmarge;

  const gegevens = {
    nummer: `${soort === "fabrieksorder" ? "FO" : soort === "factuur" ? "FA" : "OF"}-${bewaard.id
      .slice(-8)
      .toUpperCase()}-v${bewaard.versie}`,
    datum: new Date(bewaard.aangemaaktOp).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    klantnaam: bijbehorend?.klantnaam || "Nog niet ingevuld",
    projectadres: bijbehorend?.projectadres || "Nog niet ingevuld",
    leverweek: "",
  };

  if (soort === "fabrieksorder") {
    // Mét inkoopprijs — dit document gaat alleen naar Rebu-productie.
    const berekening = bereken(bewaard.configuratie, {
      context: "aannemer",
      aannemersmarge,
      toonKostprijs: true,
    });
    gegevens.leverweek = berekenLeverweek(new Date(bewaard.aangemaaktOp), berekening);
    return fabrieksorder(berekening, gegevens);
  }

  if (soort === "factuur") {
    // Onze factuur aan de aannemer: mét zijn inkoopprijs, zónder onze kostprijs.
    const berekening = bereken(bewaard.configuratie, { context: "aannemer", aannemersmarge });
    gegevens.leverweek = berekenLeverweek(new Date(bewaard.aangemaaktOp), berekening);
    return rebuFactuur(berekening, gegevens);
  }

  // Zónder kostprijs — dit document gaat naar de eindklant.
  const berekening = bereken(bewaard.configuratie, { context, aannemersmarge });
  gegevens.leverweek = berekenLeverweek(new Date(bewaard.aangemaaktOp), berekening);
  return klantofferte(berekening, gegevens, REBU_BRANDING);
}

/** De laatste versie van elk kozijn in een offerte. */
function laatsteKozijnen(projectId: string) {
  const laatstePerNaam = new Map<string, ReturnType<typeof snapshotsVanProject>[number]>();
  for (const s of snapshotsVanProject(projectId)) {
    const bestaand = laatstePerNaam.get(s.naam);
    if (!bestaand || s.versie > bestaand.versie) laatstePerNaam.set(s.naam, s);
  }
  // Op volgorde van tekenen, zodat het document de kozijnen logisch doorloopt.
  return [...laatstePerNaam.values()].sort((a, b) => a.aangemaaktOp.localeCompare(b.aangemaaktOp));
}

export async function GET(verzoek: Request) {
  const url = new URL(verzoek.url);
  const snapshotId = url.searchParams.get("snapshot");
  const projectId = url.searchParams.get("project");
  const soort = url.searchParams.get("soort") ?? "offerte";

  try {
    if (projectId) {
      const bijProject = project(projectId);
      if (!bijProject) {
        return NextResponse.json({ fout: "Deze offerte bestaat niet." }, { status: 404 });
      }
      const bladen = laatsteKozijnen(projectId).map((s) => documentVoor(s.id, soort));
      if (bladen.some((blad) => blad === null)) {
        return NextResponse.json({ fout: "Document kon niet gemaakt worden." }, { status: 500 });
      }
      return new NextResponse(
        bundelDocumenten(bladen as string[], `${soort} ${bijProject.klantnaam || bijProject.naam}`),
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    if (!snapshotId) {
      return NextResponse.json({ fout: "Geef een snapshot-id of offerte-id mee." }, { status: 400 });
    }

    const html = documentVoor(snapshotId, soort);
    if (!html) {
      return NextResponse.json({ fout: "Deze configuratieversie bestaat niet." }, { status: 404 });
    }
    return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (fout) {
    console.error("[configurator] document genereren mislukt", fout);
    return NextResponse.json(
      { fout: fout instanceof Error ? fout.message : "Document kon niet gemaakt worden." },
      { status: 500 }
    );
  }
}
