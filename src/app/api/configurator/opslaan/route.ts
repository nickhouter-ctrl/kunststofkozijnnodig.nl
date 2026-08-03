/**
 * Opslaan van een configuratie-snapshot.
 *
 * Borgingslaag 3 uit hoofdstuk 24: de server herhaalt élke controle
 * onafhankelijk van de client. Ook wanneer iemand de client-validatie omzeilt,
 * wordt een blokkerende configuratie hier geweigerd.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BlokkadeBijOpslagFout,
  koppelKlantAanProject,
  maakProject,
  slaConfiguratieOp,
} from "@/configurator/opslag/repository";
import { OnbekendProfielFout } from "@/configurator/engine";
import type { Configuratie } from "@/configurator/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * De indeling is een boom en mag bovendien per vak een indeling bínnen de
 * vleugel bevatten. Het schema is daarom dubbel recursief. De diepte wordt niet
 * expliciet begrensd; de bovengrenzen op het aantal kinderen en de maten zorgen
 * dat een absurde boom alsnog op een blokkade stuit.
 */
interface VakInvoerSchema {
  soort: "vak";
  id: string;
  naam: string;
  gewicht: number;
  vasteMaat: number | null;
  invulling: "vast" | "draaikiep" | "valraam" | "deur" | "schuifvleugel" | "paneel" | "rooster";
  draairichting: "links" | "rechts" | "geen";
  roosterId: string | null;
  roosterpositie: "boven-in-glas" | "onder-in-glas" | "boven-in-kozijn";
  horMeegeleverd: boolean;
  glastypeId: string | null;
  paneelKleurId: string | null;
  paneeltypeId: string | null;
  roeden: { verticaal: number; horizontaal: number; breedte: number } | null;
  krukBinnenId: string | null;
  krukBuitenId: string | null;
  stapeldorpel: boolean;
  roosterKleurBuitenId: string | null;
  roosterKleurBinnenId: string | null;
  naarBuitenDraaiend: boolean;
  binnenIndeling: IndelingInvoer | null;
}

interface SplitsingInvoerSchema {
  soort: "splitsing";
  id: string;
  as: "kolommen" | "rijen";
  scheidingBreedte: number;
  scheidingBreedtes?: number[];
  maatCorrecties?: number[];
  gewicht: number;
  vasteMaat: number | null;
  kinderen: IndelingInvoer[];
}

type IndelingInvoer = VakInvoerSchema | SplitsingInvoerSchema;

const indelingSchema: z.ZodType<IndelingInvoer> = z.lazy(() =>
  z.union([
    z.object({
      soort: z.literal("vak"),
      id: z.string().min(1).max(40),
      naam: z.string().min(1).max(80),
      gewicht: z.number().min(0.01).max(50),
      vasteMaat: z.number().min(0).max(20000).nullable(),
      invulling: z.enum([
        "vast",
        "draaikiep",
        "valraam",
        "deur",
        "schuifvleugel",
        "paneel",
        "rooster",
      ]),
      draairichting: z.enum(["links", "rechts", "geen"]),
      roosterId: z.string().nullable(),
      roosterpositie: z.enum(["boven-in-glas", "onder-in-glas", "boven-in-kozijn"]),
      horMeegeleverd: z.boolean(),
      glastypeId: z.string().nullable(),
      paneelKleurId: z.string().nullable(),
      paneeltypeId: z.string().nullable(),
      roeden: z
        .object({
          verticaal: z.number().int().min(0).max(20),
          horizontaal: z.number().int().min(0).max(20),
          breedte: z.number().min(1).max(200),
        })
        .nullable(),
      krukBinnenId: z.string().nullable(),
      krukBuitenId: z.string().nullable(),
      stapeldorpel: z.boolean(),
      roosterKleurBuitenId: z.string().nullable(),
      roosterKleurBinnenId: z.string().nullable(),
      naarBuitenDraaiend: z.boolean(),
      binnenIndeling: indelingSchema.nullable(),
    }),
    z.object({
      soort: z.literal("splitsing"),
      id: z.string().min(1).max(40),
      as: z.enum(["kolommen", "rijen"]),
      scheidingBreedte: z.number().min(0).max(1000),
      // Een hefschuifpui heeft per scheiding een eigen stijlbreedte en verdeelt
      // een paar millimeter tussen de vakken; beide zijn optioneel.
      scheidingBreedtes: z.array(z.number().min(0).max(1000)).max(10).optional(),
      maatCorrecties: z.array(z.number().min(-500).max(500)).max(10).optional(),
      gewicht: z.number().min(0.01).max(50),
      vasteMaat: z.number().min(0).max(20000).nullable(),
      kinderen: z.array(indelingSchema).min(1).max(10),
    }),
  ])
);

const zijdeSchema = z.object({
  aanslag: z.boolean(),
  rubber: z.boolean(),
  bijprofielId: z.string().nullable(),
});

const configuratieSchema = z.object({
  naam: z.string().min(1).max(120),
  profielId: z.string().min(1),
  kozijnType: z.enum([
    "vast",
    "draaikiep",
    "valraam",
    "voordeur",
    "achterdeur",
    "schuifpui",
    "stelkozijn",
    "renovatiekozijn",
  ]),
  vorm: z.enum(["recht", "schuin"]),
  hoekverbinding: z.enum(["verstek", "houtlook"]),
  breedte: z.number().int().min(1).max(20000),
  hoogte: z.number().int().min(1).max(20000),
  hoogteLaag: z.number().int().min(1).max(20000).nullable(),
  indeling: indelingSchema,
  kleurBinnenId: z.string().min(1),
  kleurBuitenId: z.string().min(1),
  vleugelKleurBinnenId: z.string().min(1).nullable(),
  vleugelKleurBuitenId: z.string().min(1).nullable(),
  afwatering: z.enum(["zichtbaar", "afdekkap", "verdekt", "geen"]),
  kozijnzijden: z.object({
    boven: zijdeSchema,
    onder: zijdeSchema,
    links: zijdeSchema,
    rechts: zijdeSchema,
  }),
  glas: z.object({
    meegeleverd: z.boolean(),
    glastypeId: z.string().nullable(),
    afstandshouderId: z.string().nullable(),
  }),
  beslag: z.object({ beslagId: z.string().nullable(), cilinderMeegeleverd: z.boolean() }),
  hortypeId: z.string().nullable(),
  dorpelId: z.string().nullable(),
  muuraansluitingId: z.string().min(1),
  afkitoptieId: z.string().min(1),
  borstweringHoogte: z.number().min(0).max(5000),
  aantal: z.number().int().min(1).max(500),
  staalversterking: z.boolean(),
});

const verzoekSchema = z.object({
  configuratie: configuratieSchema,
  context: z.enum(["publiek", "aannemer"]),
  aannemersmarge: z.number().min(0).max(3).optional(),
  projectId: z.string().optional(),
  projectnaam: z.string().max(160).optional(),
  /** De eindklant waar deze offerte voor is; vult naam en adres op het document. */
  klantId: z.string().optional().nullable(),
});

export async function POST(verzoek: Request) {
  let ontleed: z.infer<typeof verzoekSchema>;
  try {
    ontleed = verzoekSchema.parse(await verzoek.json());
  } catch (fout) {
    return NextResponse.json(
      {
        fout: "De verstuurde configuratie is niet geldig.",
        details: fout instanceof z.ZodError ? fout.issues.map((i) => i.path.join(".")) : undefined,
      },
      { status: 400 }
    );
  }

  try {
    const projectId =
      ontleed.projectId ??
      maakProject({
        naam: ontleed.projectnaam ?? "Nieuw project",
        context: ontleed.context,
        aannemersmarge: ontleed.aannemersmarge,
        gebruiker: "localhost-test",
      }).id;

    // De klant hangt aan het project: naam en adres komen zo op elk document.
    if (ontleed.klantId !== undefined) {
      koppelKlantAanProject(projectId, ontleed.klantId ?? null, "localhost-test");
    }

    const { snapshot, berekening } = slaConfiguratieOp({
      projectId,
      configuratie: ontleed.configuratie as unknown as Configuratie,
      // De inkoopprijs blijft hier bewust buiten beeld; de fabrieksorder haalt
      // hem los op met een eigen berekening (regel 6).
      prijsOpties: { context: ontleed.context, aannemersmarge: ontleed.aannemersmarge },
      gebruiker: "localhost-test",
    });

    return NextResponse.json({
      snapshotId: snapshot.id,
      projectId,
      versie: snapshot.versie,
      klantprijsTotaalInclBtw: berekening.prijs.klantprijsTotaalInclBtw,
      waarschuwingen: berekening.bevindingen.filter((b) => b.type === "waarschuwing"),
    });
  } catch (fout) {
    if (fout instanceof BlokkadeBijOpslagFout) {
      return NextResponse.json(
        { fout: "De server heeft de configuratie geweigerd.", blokkades: fout.koppen },
        { status: 422 }
      );
    }
    if (fout instanceof OnbekendProfielFout) {
      return NextResponse.json({ fout: fout.message }, { status: 400 });
    }
    console.error("[configurator] opslaan mislukt", fout);
    return NextResponse.json({ fout: "Er ging iets mis bij het opslaan." }, { status: 500 });
  }
}
