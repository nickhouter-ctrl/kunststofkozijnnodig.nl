/**
 * Escalatie naar een mens (regel 4 uit hoofdstuk 1).
 *
 * Slaat de aanvraag op mét de volledige configuratie, zodat niemand hoeft over
 * te typen en Rebu direct ziet waar de gebruiker op vastliep.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { slaEscalatieOp } from "@/configurator/opslag/repository";
import type { Configuratie } from "@/configurator/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  naam: z.string().min(1).max(120),
  contact: z.string().min(3).max(160),
  bericht: z.string().max(4000).default(""),
  // De configuratie wordt integraal bewaard; hij hoeft hier niet geldig te zijn
  // — juist een onmogelijke configuratie is de reden om te escaleren.
  configuratie: z.record(z.string(), z.unknown()),
  bevindingen: z.unknown(),
});

export async function POST(verzoek: Request) {
  try {
    const invoer = schema.parse(await verzoek.json());
    const id = slaEscalatieOp({
      naam: invoer.naam,
      contact: invoer.contact,
      bericht: invoer.bericht,
      configuratie: invoer.configuratie as unknown as Configuratie,
      bevindingen: invoer.bevindingen,
    });

    // In productie gaat hier ook een mail naar Rebu; op localhost blijft het
    // bij vastleggen zodat er geen mail de deur uit gaat tijdens het testen.
    return NextResponse.json({ id, bericht: "Uw aanvraag is vastgelegd." });
  } catch (fout) {
    if (fout instanceof z.ZodError) {
      return NextResponse.json({ fout: "Vul uw naam en contactgegevens in." }, { status: 400 });
    }
    console.error("[configurator] escalatie mislukt", fout);
    return NextResponse.json({ fout: "Er ging iets mis." }, { status: 500 });
  }
}
