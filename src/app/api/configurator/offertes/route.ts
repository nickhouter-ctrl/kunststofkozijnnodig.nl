/**
 * Het offerteoverzicht van het dashboard, en het terughalen van één offerte.
 *
 * Zonder `project` in de query komt de lijst terug; mét project komen alle
 * kozijnen van de laatste versie terug, zodat de configurator ze weer kan
 * openen en er verder aan gewerkt kan worden. De oude versies blijven daarbij
 * gewoon bewaard: opslaan maakt een nieuwe versie (hoofdstuk 15.2).
 */
import { NextResponse } from "next/server";
import {
  koppelKlantAanProject,
  offerteoverzicht,
  project,
  snapshotsVanProject,
} from "@/configurator/opslag/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(verzoek: Request) {
  const projectId = new URL(verzoek.url).searchParams.get("project");
  if (!projectId) {
    return NextResponse.json({ offertes: offerteoverzicht() });
  }

  const gevonden = project(projectId);
  if (!gevonden) {
    return NextResponse.json({ fout: "Deze offerte bestaat niet." }, { status: 404 });
  }

  // Per kozijn alleen de laatste versie: dat is waar je aan verder werkt.
  const laatstePerNaam = new Map<string, ReturnType<typeof snapshotsVanProject>[number]>();
  for (const s of snapshotsVanProject(projectId)) {
    const bestaand = laatstePerNaam.get(s.naam);
    if (!bestaand || s.versie > bestaand.versie) laatstePerNaam.set(s.naam, s);
  }

  return NextResponse.json({
    project: gevonden,
    // In de volgorde waarin ze getekend zijn, niet omgekeerd.
    kozijnen: [...laatstePerNaam.values()]
      .sort((a, b) => a.aangemaaktOp.localeCompare(b.aangemaaktOp))
      .map((s) => ({
      snapshotId: s.id,
      naam: s.naam,
      versie: s.versie,
      bevroren: s.bevroren,
      configuratie: s.configuratie,
    })),
  });
}

export async function PATCH(verzoek: Request) {
  const body = await verzoek.json().catch(() => ({}));
  const projectId = typeof body?.projectId === "string" ? body.projectId : null;
  if (!projectId) return NextResponse.json({ fout: "Geen offerte-id meegegeven." }, { status: 400 });

  const klantId = typeof body?.klantId === "string" ? body.klantId : null;
  const bijgewerkt = koppelKlantAanProject(projectId, klantId, "localhost-test");
  if (!bijgewerkt) {
    return NextResponse.json({ fout: "Offerte of klant niet gevonden." }, { status: 404 });
  }
  return NextResponse.json({ project: bijgewerkt });
}
