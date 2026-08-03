/**
 * De klantenlijst van de aannemer: de eindklanten waar hij offertes voor maakt.
 *
 * Bewust een eenvoudige lijst met alleen wat er op een offerte moet komen. Een
 * klant verwijderen laat bestaande offertes ongemoeid — die dragen hun eigen
 * kopie van naam en adres, zodat een verstuurd document nooit met terugwerkende
 * kracht verandert.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { klanten, maakKlant, verwijderKlant, wijzigKlant } from "@/configurator/opslag/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const klantSchema = z.object({
  naam: z.string().trim().min(1, "Een klant heeft een naam nodig").max(160),
  contactpersoon: z.string().trim().max(160).default(""),
  email: z.string().trim().max(160).default(""),
  telefoon: z.string().trim().max(60).default(""),
  adres: z.string().trim().max(200).default(""),
  postcode: z.string().trim().max(20).default(""),
  plaats: z.string().trim().max(120).default(""),
  notitie: z.string().trim().max(2000).default(""),
});

export async function GET() {
  return NextResponse.json({ klanten: klanten() });
}

export async function POST(verzoek: Request) {
  const ontleed = klantSchema.safeParse(await verzoek.json().catch(() => ({})));
  if (!ontleed.success) {
    return NextResponse.json(
      { fout: ontleed.error.issues[0]?.message ?? "De klantgegevens zijn niet geldig." },
      { status: 400 }
    );
  }
  return NextResponse.json({ klant: maakKlant(ontleed.data, "localhost-test") });
}

export async function PATCH(verzoek: Request) {
  const body = await verzoek.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : null;
  const ontleed = klantSchema.safeParse(body);
  if (!id || !ontleed.success) {
    return NextResponse.json(
      { fout: ontleed.success ? "Geen klant-id meegegeven." : ontleed.error.issues[0].message },
      { status: 400 }
    );
  }
  const bijgewerkt = wijzigKlant(id, ontleed.data, "localhost-test");
  if (!bijgewerkt) return NextResponse.json({ fout: "Deze klant bestaat niet." }, { status: 404 });
  return NextResponse.json({ klant: bijgewerkt });
}

export async function DELETE(verzoek: Request) {
  const id = new URL(verzoek.url).searchParams.get("id");
  if (!id) return NextResponse.json({ fout: "Geen klant-id meegegeven." }, { status: 400 });
  if (!verwijderKlant(id, "localhost-test")) {
    return NextResponse.json({ fout: "Deze klant bestaat niet." }, { status: 404 });
  }
  return NextResponse.json({ verwijderd: true });
}
